import { useEffect, useState } from "react";
import { 
  View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView, Modal, Alert, Share, Linking 
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../utils/AuthContext"; // Import the auth context
import HTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";
const FRONTEND_BASE_URL = "https://new-hope.com/news"; 

export default function ViewNewsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { id } = route.params;
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [author, setAuthor] = useState("");
  const [storedUserId, setStoredUserId] = useState(null);
  const { width } = useWindowDimensions(); // for handling responsive design

  useEffect(() => {
    const fetchUserId = async () => {
      const uid = await AsyncStorage.getItem("user_id");
      setStoredUserId(uid);
    };
    fetchUserId();
  }, []);

  const loggedInUserId = user?.id ? user.id.toString() : storedUserId;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/news/${id}`);
        setNews(response.data);

        // Determine author
        if (response.data.status === "admin") {
          setAuthor("Admin");
        } else if (response.data.user_id) {
          try {
            const mobileUserResponse = await axios.get(`${API_BASE_URL}/mobileusers/${response.data.user_id}`);
            setAuthor(mobileUserResponse.data.name);
          } catch (userError) {
            console.error("Error fetching mobile user info:", userError);
            setAuthor("User");
          }
        } else {
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

  const handleShare = async () => {
    try {
      const shareOptions = {
        message: `📢 *${news.title}* \n\n${news.content.slice(0, 100)}...\n\n🔗 Read more: ${FRONTEND_BASE_URL}/${news.id}`,
      };
      await Share.share(shareOptions);
    } catch (error) {
      console.error("❌ Error sharing news:", error);
      Alert.alert("Error", "Failed to share news.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }
      await axios.delete(`${API_BASE_URL}/user/news/${id}`, {
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

  const handleLinkPress = () => {
    // Navigate to the SubmitSkillsScreen when the link is clicked
    navigation.navigate("SubmitSkillsScreen"); // Navigate directly to the SubmitSkillsScreen
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
        {news.thumbnail ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image 
              source={{ uri: news.thumbnail.startsWith("http") ? news.thumbnail : `${API_BASE_URL}${news.thumbnail}` }}
              style={{ width: 300, height: 200, borderRadius: 10, marginBottom: 20 }} 
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

        {/* Render the HTML content properly with paragraph formatting */}
        <HTML 
          source={{ html: news.content }} 
          tagsStyles={{ 
            p: { 
              fontSize: 18, // Bigger text
              lineHeight: 28, // Proper line spacing
              marginBottom: 15, // Space between paragraphs
              textAlign: 'center', // Center-aligned text
            },
            a: { 
              color: 'blue', 
              textDecorationLine: 'underline' 
            }
          }}
          renderersProps={{
            a: {
              onPress: () => handleLinkPress(),
            }
          }}
          contentWidth={width} // Pass contentWidth for responsive scaling
        />

        {/* Conditionally render the link if showSkillsLink is true */}
        {news?.showSkillsLink && (
          <TouchableOpacity onPress={handleLinkPress}>
            <Text style={{ fontSize: 18, color: "blue", textDecorationLine: "underline", textAlign: "center" }}>
              Click here to submit your skills
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10 }}>
        {loggedInUserId === news.user_id.toString() && (
          <>
            <TouchableOpacity 
              onPress={() => navigation.navigate("EditNews", { edit: true, id: news.id })}
              style={{ backgroundColor: "#007bff", padding: 10, borderRadius: 5, flex: 1, marginRight: 5 }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDelete(news.id)}
              style={{ backgroundColor: "#dc3545", padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Share News Button */}
      <TouchableOpacity 
        onPress={handleShare}
        style={{ backgroundColor: "#25D366", padding: 12, borderRadius: 8, marginTop: 10, alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>📢 Share News</Text>
      </TouchableOpacity>

      {/* Image Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }} onPress={() => setModalVisible(false)}>
          <Image source={{ uri: news.thumbnail }} style={{ width: "90%", height: 400, borderRadius: 10, resizeMode: "contain" }} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
