import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity, ScrollView, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/user/news"; // Corrected API URL for user-specific news

export default function CreateNewsScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Presidential Campaign", // Defaulrt category
    status: "user", // Default status for mobile
    author: "", // Author field
    thumbnail: null,
  });

  const categories = ["Presidential Campaign", "Health", "Education", "Environment", "Elderly Care", "Labor", "Technology", "Political Support"];

  useEffect(() => {
    (async () => {
      const userId = await AsyncStorage.getItem("user_id");
      if (userId) {
        setFormData(prevState => ({ ...prevState, user_id: userId }));  // Fix missing user_id
      }
    })();
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

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

      setFormData({
        ...formData,
        thumbnail: {
          uri: localUri,
          name: filename,
          type: ext,
        },
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
  
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }
  
      console.log("Form Data Before Send: ", formData);  // Log form data to check if the thumbnail is added
      
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "thumbnail" && value) {
          data.append("thumbnail", {
            uri: value.uri,
            name: value.name,
            type: value.type,
          });
        } else {
          data.append(key, value);
        }
      });
  
      await axios.post(API_BASE_URL, data, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      Alert.alert("Success", "News story created successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error creating news story:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "Failed to create news story.");
    }
  };
  
  

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop: 60 }}>
     <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: "flex-start", marginBottom: 20, marginTop: 40 }}>
        <Text style={{ fontSize: 18, color: "blue" }}>← Back</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Create News Story</Text>
      
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

      <Text style={{ fontSize: 16, marginBottom: 10 }}>Author: {formData.author}</Text>

      <TouchableOpacity onPress={pickImage} style={{ backgroundColor: "#007bff", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Pick Thumbnail</Text>
      </TouchableOpacity>

      {formData.thumbnail && (
        <Image source={{ uri: formData.thumbnail.uri }} style={{ width: 200, height: 150, borderRadius: 10, marginBottom: 10 }} />
      )}

      <Button title="Create News" onPress={handleSubmit} />
    </ScrollView>
  );
}
