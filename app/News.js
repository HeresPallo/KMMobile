import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView, ScrollView, Alert, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// Base API URL on Heroku
const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/";
// URL for uploaded images
const UPLOADS_URL = `${API_BASE_URL}uploads/`;

// Adjustable card height (you can tweak this value)
const CARD_HEIGHT = 220;  // For example, set a base height for each card

export default function NewsScreen() {
  const navigation = useNavigation();
  const [adminNews, setAdminNews] = useState([]);
  const [userNews, setUserNews] = useState([]); // Stories from other users
  const [myNews, setMyNews] = useState([]);     // Stories created by the logged-in user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Retrieve JWT token and current user ID from AsyncStorage
        const token = await AsyncStorage.getItem("token");
        const currentUserId = await AsyncStorage.getItem("user_id");

        if (!token) {
          Alert.alert("Authentication Error", "You need to be logged in to view the news.");
          return;
        }

        // Fetch all news stories from the `/news` endpoint
        const response = await axios.get(`${API_BASE_URL}news`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        const allNews = response.data;

        // Filter admin stories (status === "admin")
        const adminStories = allNews.filter(news => news.status === "admin");

        // Filter all user stories (status === "user")
        const allUserStories = allNews.filter(news => news.status === "user");

        // Split user stories: my stories and other user stories
        const myStories = allUserStories.filter(news => news.user_id.toString() === currentUserId);
        const otherUserStories = allUserStories.filter(news => news.user_id.toString() !== currentUserId);

        setAdminNews(adminStories);
        setUserNews(otherUserStories);
        setMyNews(myStories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const renderNewsCard = ({ item, size }) => {
    // Construct image URL: if already a full URL, use it; otherwise, prepend the uploads URL.
    const imageUrl = item.thumbnail && item.thumbnail.startsWith("http")
      ? item.thumbnail
      : `${UPLOADS_URL}${item.thumbnail}`;

    return (
      <TouchableOpacity onPress={() => navigation.navigate("ViewNews", { id: item.id })}>
        <View style={{
          margin: 10,
          backgroundColor: "#fff",
          borderRadius: 10,
          overflow: "hidden",
          elevation: 3,
          width: size,
          minHeight: CARD_HEIGHT + 50, // CARD_HEIGHT plus extra space for title
          paddingBottom: 5,
        }}>
          {item.thumbnail ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: CARD_HEIGHT }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ height: CARD_HEIGHT, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ padding: 10, fontWeight: "bold", color: "gray" }}>No Image Available</Text>
            </View>
          )}
          <View style={{ paddingHorizontal: 10, paddingTop: 5 }}>
            <Text style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
              {item.title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Admin Stories Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Admin Stories</Text>
            <FlatList
              horizontal
              data={adminNews}
              renderItem={({ item }) => renderNewsCard({ item, size: 300 })}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          </View>

          {/* User Stories Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>User Stories</Text>
            <FlatList
              horizontal
              data={userNews}
              renderItem={({ item }) => renderNewsCard({ item, size: 200 })}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          </View>

          {/* My Stories Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Stories</Text>
            <FlatList
              horizontal
              data={myNews}
              renderItem={({ item }) => renderNewsCard({ item, size: 200 })}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          </View>
        </ScrollView>

        {/* Fixed Post a Story Button */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateNews")}
            style={styles.postButton}
          >
            <Text style={styles.postButtonText}>Post a Story</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    paddingTop: 60,
    paddingBottom: 100, // Extra bottom padding to ensure content doesn't hide behind the fixed button
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  postButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
