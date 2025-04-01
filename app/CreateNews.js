import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/user/news";

export default function CreateNewsScreen() {
  const navigation = useNavigation();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Art",
    status: "user",
    author: "",
    thumbnail: null,
  });

  const categories = [
    "Art", "Business", "Culture", "Education",
    "Economy", "Elderly Care", "Entertainment", "Environment",
    "Health", "Labor", "Local News", "Other",
    "Political Support", "Presidential Campaign", "Science", "Social Issues",
    "Sports", "Technology", "Transportation", "Youth"
  ];

  useEffect(() => {
    (async () => {
      const userId = await AsyncStorage.getItem("user_id");
      if (userId) {
        setFormData((prevState) => ({ ...prevState, user_id: userId }));
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
      const manipResult = await ImageManipulator.manipulateAsync(localUri, [], { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG });
      const filename = manipResult.uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? `image/${match[1]}` : "image/jpeg";
      setFormData({ ...formData, thumbnail: { uri: manipResult.uri, name: filename, type: ext } });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        setIsUploading(false);
        return;
      }
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "thumbnail" && value) {
          data.append("thumbnail", { uri: value.uri, name: value.name, type: value.type });
        } else {
          data.append(key, value);
        }
      });
      await axios.post(API_BASE_URL, data, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      Alert.alert("Success", "News story created successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error creating news story:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "Failed to create news story.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isUploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.uploadText}>Uploading...</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Create News Story</Text>
      <TextInput placeholder="Post Title" onChangeText={(value) => handleChange("title", value)} value={formData.title} style={styles.input} />
      <TextInput placeholder="Post Content" multiline numberOfLines={6} textAlignVertical="top" onChangeText={(value) => handleChange("content", value)} value={formData.content} style={styles.textarea} />
      <Text style={styles.label}>Select Category:</Text>
      <Picker selectedValue={formData.category} onValueChange={(itemValue) => handleChange("category", itemValue)} style={styles.picker}>
        {categories.map((cat) => (<Picker.Item key={cat} label={cat} value={cat} />))}
      </Picker>
      <Text style={styles.authorText}>Author: {formData.author}</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>Pick Thumbnail</Text>
      </TouchableOpacity>
      {formData.thumbnail && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: formData.thumbnail.uri }} style={styles.imagePreview} />
        </View>
      )}
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Create News</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop: 60 },
  uploadOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 10 },
  uploadText: { color: "#FFFFFF", marginTop: 10 },
  backButton: { alignSelf: "flex-start", marginBottom: 20, marginTop: 40 },
  backText: { fontSize: 18, color: "blue" },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5, alignSelf: "flex-start" },
  input: { borderWidth: 1, padding: 12, width: "100%", marginBottom: 12, borderRadius: 10 },
  textarea: { borderWidth: 1, padding: 12, width: "100%", height: 120, borderRadius: 10, marginBottom: 12 },
  picker: { width: "100%", marginBottom: 12 },
  authorText: { fontSize: 16, marginBottom: 10 },
  imageButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginBottom: 10 },
  imageButtonText: { color: "white", fontWeight: "bold" },
  imagePreviewContainer: { borderRadius: 10, overflow: "hidden", marginBottom: 10 },
  imagePreview: { width: 200, height: 150, borderRadius: 10 },
  submitButton: { backgroundColor: "green", padding: 15, borderRadius: 10, alignItems: "center" },
  submitButtonText: { color: "white", fontWeight: "bold" },
});
