import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/";
const UPLOADS_URL = `${API_BASE_URL}uploads/`;

export default function NewsScreen() {
  const navigation = useNavigation();
  const [adminNews, setAdminNews] = useState([]);
  const [userNews, setUserNews] = useState([]);
  const [myNews, setMyNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("admin"); // To control the selected tab

  const fetchNews = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const currentUserId = await AsyncStorage.getItem("user_id");

      if (!token) {
        Alert.alert("Authentication Error", "You need to be logged in to view the news.");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}news`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allNews = response.data;

      const adminStories = allNews.filter((news) => news.status === "admin");
      const allUserStories = allNews.filter((news) => news.status === "user");
      const myStories = allUserStories.filter((news) => news.user_id.toString() === currentUserId);
      const otherUserStories = allUserStories.filter((news) => news.user_id.toString() !== currentUserId);

      setAdminNews(adminStories);
      setUserNews(otherUserStories);
      setMyNews(myStories);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      fetchNews();
      return;
    }
    const lowerQuery = query.toLowerCase();
    setAdminNews((prev) => prev.filter(news => news.title.toLowerCase().includes(lowerQuery) || news.category.toLowerCase().includes(lowerQuery)));
    setUserNews((prev) => prev.filter(news => news.title.toLowerCase().includes(lowerQuery) || news.category.toLowerCase().includes(lowerQuery)));
    setMyNews((prev) => prev.filter(news => news.title.toLowerCase().includes(lowerQuery) || news.category.toLowerCase().includes(lowerQuery)));
  };

  const renderNewsCard = ({ item }) => {
    const imageUrl = item.thumbnail && item.thumbnail.startsWith("http")
      ? item.thumbnail
      : `${UPLOADS_URL}${item.thumbnail}`;
    return (
      <TouchableOpacity onPress={() => navigation.navigate("ViewNews", { id: item.id })}>
        <View style={styles.newsCard}>
          {item.thumbnail ? (
            <Image source={{ uri: imageUrl }} style={styles.newsImage} resizeMode="cover" />
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No Image Available</Text>
            </View>
          )}
          <View style={styles.newsTextContainer}>
            <Text style={styles.newsTitle}>{item.title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/kmlogo.jpeg")} style={styles.logo} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search news..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Tabs for Admin, User, and My Stories */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "admin" && styles.selectedTab]}
          onPress={() => setSelectedTab("admin")}
        >
          <Text style={styles.tabText}>Admin Stories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "user" && styles.selectedTab]}
          onPress={() => setSelectedTab("user")}
        >
          <Text style={styles.tabText}>User Stories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "my" && styles.selectedTab]}
          onPress={() => setSelectedTab("my")}
        >
          <Text style={styles.tabText}>My Stories</Text>
        </TouchableOpacity>
      </View>

      {/* Stories Content based on Selected Tab */}
      <FlatList
        data={selectedTab === "admin" ? adminNews : selectedTab === "user" ? userNews : myNews}
        renderItem={renderNewsCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Post a Story Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateNews")}
          style={styles.postButton}
        >
          <Text style={styles.postButtonText}>Post a Story</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10, // To prevent cards from touching the screen's edges
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  searchBar: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  // Tab styles, ensuring they are correctly styled
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  selectedTab: {
    borderBottomColor: "red",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // Style for FlatList to ensure it is centered
  flatListContent: {
    flexDirection: "row", // Align items horizontally
    justifyContent: "center", // Center the items horizontally
    alignItems: "center", // Center vertically if items exceed one line
    flexWrap: "wrap", // Allow items to wrap to the next line
    paddingBottom: 20, // Adds space at the bottom of the list
  },
  newsCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    width: 355, // Width of the card
    height: 240, // Adjust the height of the card for better spacing
    marginHorizontal: 10, // Space between cards horizontally
    marginBottom: 20, // Add margin between cards vertically
    paddingBottom: 10, // Ensure the text has enough space inside the card
  },
  newsImage: {
    width: "100%",
    height: 180, // Fixed image height
  },
  newsTextContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  noImageContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noImageText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "gray",
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0, // Anchors to the bottom
    width: "100%",
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    paddingBottom: 15,
    zIndex: 10, // Keeps it on top
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
