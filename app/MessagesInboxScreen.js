import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl, 
  Linking 
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function MessagesInboxScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const userPhoneNumber = route.params?.phone_number;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessages = () => {
    if (!userPhoneNumber) {
      console.warn("User phone number is missing.");
      setMessages([]);
      setLoading(false);
      return;
    }

    axios.get(`${API_BASE_URL}/messages`, { params: { phone: userPhoneNumber } })
      .then((response) => setMessages(response.data))
      .catch((error) => {
        console.error("Error fetching messages:", error);
        Alert.alert("Error", "Failed to load messages.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, [userPhoneNumber]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages();
    setRefreshing(false);
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/messages/${id}`);
      setMessages(prevMessages => prevMessages.filter(message => message.id !== id));
      Alert.alert("Success", "Message deleted successfully.");
    } catch (error) {
      console.error("Error deleting message:", error);
      Alert.alert("Error", "Failed to delete message.");
    }
  };

  // Function to open URLs in the default browser
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  // Function to render each message
  const renderMessageItem = ({ item }) => {
    // Regular expression to match URLs in the text
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Function to make URLs clickable
    const renderTextWithLinks = (text) => {
      const parts = text.split(urlRegex);
      return parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <Text
              key={index}
              style={styles.linkText}
              onPress={() => handleLinkPress(part)}  // Handle link click
            >
              {part}
            </Text>
          );
        } else {
          return <Text key={index}>{part}</Text>;
        }
      });
    };

    return (
      <View style={styles.messageCard}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageText}>{renderTextWithLinks(item.message)}</Text>
          <TouchableOpacity onPress={() => deleteMessage(item.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sentDate}>{new Date(item.created_at).toLocaleString()}</Text>
        {item.admin_response ? (
          <View style={styles.adminResponseContainer}>
            <Text style={styles.adminResponseText}>{renderTextWithLinks(item.admin_response)}</Text>
          </View>
        ) : (
          <Text style={styles.noResponseText}>No response yet.</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Messages</Text>

      {messages.length === 0 ? (
        <Text style={styles.noMessagesText}>No messages found.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: "#007bff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#FF4040",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  noMessagesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageCard: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 1,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
    flex: 1,
  },
  sentDate: {
    color: "#777",
    fontSize: 12,
    marginBottom: 10,
  },
  adminResponseContainer: {
    backgroundColor: "#E3FCEC",
    padding: 10,
    borderRadius: 8,
  },
  adminResponseText: {
    fontSize: 14,
    color: "#065F46",
  },
  noResponseText: {
    color: "#FF0000",
    marginTop: 5,
    fontSize: 14,
  },
  linkText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
});
