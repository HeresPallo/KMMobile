import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, StyleSheet 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com"; // Production API URL

export default function MessagesInboxScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/messages`)
      .then((response) => setMessages(response.data))
      .catch((error) => {
        console.error("Error fetching messages:", error);
        Alert.alert("Error", "Failed to load messages.");
      })
      .finally(() => setLoading(false));
  }, []);

  const renderMessageItem = ({ item }) => (
    <View style={styles.messageCard}>
      <Text style={styles.messageText}>📨 {item.message}</Text>
      <Text style={styles.sentDate}>
        Sent: {new Date(item.created_at).toLocaleString()}
      </Text>
      {item.admin_response ? (
        <View style={styles.adminResponseContainer}>
          <Text style={styles.adminResponseTitle}>👨‍💼 Admin Response:</Text>
          <Text style={styles.adminResponseText}>{item.admin_response}</Text>
        </View>
      ) : (
        <Text style={styles.noResponseText}>No response yet.</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>📥 Messages</Text>
      {messages.length === 0 ? (
        <Text style={styles.noMessagesText}>No messages found.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
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
    color: "blue",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
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
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 16,
    marginBottom: 5,
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
  adminResponseTitle: {
    color: "#065F46",
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 14,
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
});
