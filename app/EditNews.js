import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Define separate base URLs for GET and PATCH
const GET_API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/news"; // For fetching a news story
const PATCH_API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/user/news"; // For updating a news story

export default function EditNewsScreen({ route }) {
  const navigation = useNavigation();
  const { id } = route.params;
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Presidential Campaign",
    thumbnail: null,
  });
  const categories = ["Presidential Campaign", "Health", "Education", "Environment", "Elderly Care", "Labor", "Technology", "Political Support"];

  // Fetch the existing news details using the GET endpoint
  useEffect(() => {
    axios.get(`${GET_API_BASE_URL}/${id}`)
      .then(response => {
        setFormData({
          title: response.data.title,
          content: response.data.content,
          category: response.data.category,
          // Assume the backend returns a full URL for thumbnail, or null
          thumbnail: response.data.thumbnail ? response.data.thumbnail : null,
        });
      })
      .catch(error => {
        console.error("Error fetching news story:", error);
        Alert.alert("Error", "Failed to fetch news story.");
      });
  }, [id]);

  const handleChange = (name, value) => {
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Function to pick a new image for the thumbnail
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? `image/${match[1]}` : `image`;
      
      setFormData(prevState => ({
        ...prevState,
        thumbnail: {
          uri: localUri,
          name: filename,
          type: ext,
        },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Retrieve the JWT token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }
  
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "thumbnail" && value && typeof value === "object") {
          data.append("thumbnail", {
            uri: value.uri,
            name: value.name,
            type: value.type,
          });
        } else {
          data.append(key, value);
        }
      });
      
      // Use the PATCH endpoint for updating the news story
      await axios.patch(`${PATCH_API_BASE_URL}/${id}`, data, {
        headers: { 
          "Authorization": `Bearer ${token}`,  // Send the token in the header
          "Content-Type": "multipart/form-data",
        },
      });
      
      Alert.alert("Success", "News story updated successfully!");
      navigation.navigate("News"); // Navigate back to News screen
    } catch (error) {
      console.error("Error updating news story:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "Failed to update news story.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop: 60 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: "flex-start", marginBottom: 20, marginTop: 40 }}>
        <Text style={{ fontSize: 18, color: "blue" }}>← Back</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Edit News Story</Text>
      
      <TextInput 
        placeholder="Post Title"
        onChangeText={(value) => handleChange("title", value)}
        value={formData.title}
        style={{ borderWidth: 1, padding: 10, width: "100%", marginBottom: 10, borderRadius: 10 }}
      />
      
      <TextInput 
        placeholder="Post Content"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        onChangeText={(value) => handleChange("content", value)}
        value={formData.content}
        style={{ borderWidth: 1, padding: 10, width: "100%", height: 120, borderRadius: 10, marginBottom: 10 }}
      />
      
      <Picker
        selectedValue={formData.category}
        onValueChange={(itemValue) => handleChange("category", itemValue)}
        style={{ width: "100%", marginBottom: 10, borderRadius: 10 }}
      >
        {categories.map((cat) => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>
      
      <TouchableOpacity onPress={pickImage} style={{ backgroundColor: "#007bff", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Pick Thumbnail</Text>
      </TouchableOpacity>
      
      {formData.thumbnail ? (
        <Image 
          source={{ uri: typeof formData.thumbnail === "object" ? formData.thumbnail.uri : formData.thumbnail }} 
          style={{ width: 200, height: 150, borderRadius: 10, marginBottom: 10 }} 
        />
      ) : (
        <Text>No Thumbnail</Text>
      )}
      
      <Button title="Update News" onPress={handleSubmit} />
    </ScrollView>
  );
}
