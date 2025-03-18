import { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Update these URLs to match your Heroku deployment
const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/uploads/";
const HEROKU_API = "https://new-hope-e46616a5d911.herokuapp.com";

export default function ViewNewsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [author, setAuthor] = useState("");
  const [userId, setUserId] = useState(null);

  // Retrieve logged in user's id from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("user_id");
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  // Fetch the news item and then the author's name
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${HEROKU_API}/news/${id}`);
        console.log("Fetched news:", response.data);
        setNews(response.data);
        if (response.data.user_id) {
          if (response.data.user_id === 999) {
            setAuthor("Admin");
          } else {
            try {
              // Fetch mobile user info from the new endpoint
              const mobileUserResponse = await axios.get(`${HEROKU_API}/mobileusers/${response.data.user_id}`);
              setAuthor(mobileUserResponse.data.name);
            } catch (userError) {
              console.error("Error fetching mobile user info:", userError);
              setAuthor("User");
            }
          }
        } else {
          console.error("No user_id found in news data");
          setAuthor("Unknown Author");
        }
      } catch (error) {
        console.error("Error fetching news story:", error);
        Alert.alert("Error", "Failed to fetch news story.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  const handleDelete = async (id, navigation) => {
    try {
      // Retrieve the JWT token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }
  
      // Send DELETE request to the backend endpoint
      await axios.delete(`${HEROKU_API}/user/news/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      Alert.alert("Success", "News story deleted successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting news story:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "Failed to delete news story.");
    }
  };
  
  if (loading || !news) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa", padding: 20, paddingTop: (StatusBar.currentHeight || 0) + 20 }}>
      <TouchableOpacity 
        onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("News")} 
        style={{ alignSelf: "flex-start", marginBottom: 20, marginTop: 40 }}
      >
        <Text style={{ fontSize: 18, color: "blue" }}>← Back</Text>
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}>
        {news && news.thumbnail ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image 
              source={{ uri: news.thumbnail.startsWith("http") ? news.thumbnail : `${API_BASE_URL}${news.thumbnail}` }}
              style={{ width: 300, height: 200, borderRadius: 10, marginBottom: 20 }} 
              onError={(e) => {
                console.error("❌ Image Load Error:", e.nativeEvent.error);
              }}
            />
          </TouchableOpacity>
        ) : (
          <Text style={{ fontSize: 16, color: "gray" }}>No Image Available</Text>
        )}
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
          {news.title}
        </Text>
        <Text style={{ fontSize: 16, color: "gray", marginBottom: 10, textAlign: "center" }}>
          By: {author || "Unknown Author"}
        </Text>
        <Text style={{ fontSize: 16, color: "gray", marginBottom: 20, textAlign: "center" }}>
          {news.category}
        </Text>
        <Text style={{ fontSize: 18, textAlign: "center", lineHeight: 24, paddingHorizontal: 10 }}>
          {news.content}
        </Text>
      </ScrollView>
      
      {news && userId && userId === news.user_id.toString() && (
        <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 10 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("EditNews", { edit: true, id: news.id })}
            style={{ backgroundColor: "#007bff", padding: 10, borderRadius: 5 }}
          >
            <Text style={{ color: "white" }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(news.id, navigation)}
            style={{ backgroundColor: "#dc3545", padding: 10, borderRadius: 5 }}
          >
            <Text style={{ color: "white" }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <Modal 
        visible={modalVisible} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={{
            flex: 1, 
            backgroundColor: "rgba(0,0,0,0.9)", 
            justifyContent: "center", 
            alignItems: "center"
          }} 
          onPress={() => setModalVisible(false)}
        >
          {news && news.thumbnail ? (
            <Image 
              source={{ uri: news.thumbnail.startsWith("http") ? news.thumbnail : `${API_BASE_URL}${news.thumbnail}` }}
              style={{ width: "90%", height: 400, borderRadius: 10, resizeMode: "contain" }} 
              onError={(e) => {
                console.error("❌ Image Load Error:", e.nativeEvent.error);
              }}
            />
          ) : (
            <Text style={{ fontSize: 16, color: "white", marginTop: 20 }}>No Image Available</Text>
          )}
          <Text style={{ color: "white", fontSize: 18, marginTop: 20, textAlign: "center" }}>
            Tap anywhere to close
          </Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
