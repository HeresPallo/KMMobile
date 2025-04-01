import { useEffect, useState } from "react";
import { 
  View, Text, TextInput, Alert, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GET_API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/news";
const PATCH_API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/user/news";

export default function EditNewsScreen({ route }) {
  const navigation = useNavigation();
  const { id } = route.params;
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Art",
    thumbnail: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const categories = [
    "Art", "Business", "Culture", "Education", "Economy", "Elderly Care", "Entertainment", "Environment",
    "Health", "Labor", "Local News", "Other", "Political Support", "Presidential Campaign", "Science", "Social Issues",
    "Sports", "Technology", "Transportation", "Youth"
  ];

  useEffect(() => {
    axios.get(`${GET_API_BASE_URL}/${id}`)
      .then(response => {
        setFormData({
          title: response.data.title,
          content: response.data.content,
          category: response.data.category,
          thumbnail: response.data.thumbnail || null,
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
      const ext = match ? `image/${match[1]}` : "image";

      setFormData(prevState => ({
        ...prevState,
        thumbnail: { uri: localUri, name: filename, type: ext },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "thumbnail" && value && typeof value === "object") {
          data.append("thumbnail", { uri: value.uri, name: value.name, type: value.type });
        } else {
          data.append(key, value);
        }
      });

      await axios.patch(`${PATCH_API_BASE_URL}/${id}`, data, {
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "News story updated successfully!");
      navigation.reset({ index: 0, routes: [{ name: "News" }] });
    } catch (error) {
      console.error("Error updating news story:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "Failed to update news story.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Updating...</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Edit News Story</Text>
      <TextInput placeholder="Post Title" onChangeText={(value) => handleChange("title", value)} value={formData.title} style={styles.input} />
      <TextInput placeholder="Post Content" multiline numberOfLines={6} textAlignVertical="top" onChangeText={(value) => handleChange("content", value)} value={formData.content} style={styles.textarea} />
      <Text style={styles.label}>Select Category:</Text>
      <Picker selectedValue={formData.category} onValueChange={(itemValue) => handleChange("category", itemValue)} style={styles.picker}>
        {categories.map((cat) => (<Picker.Item key={cat} label={cat} value={cat} />))}
      </Picker>
      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>Pick Thumbnail</Text>
      </TouchableOpacity>
      {formData.thumbnail && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: typeof formData.thumbnail === "object" ? formData.thumbnail.uri : formData.thumbnail }} style={styles.imagePreview} />
        </View>
      )}
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Update News</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop: 60 },
  loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#FFFFFF", marginTop: 10 },
  backButton: { alignSelf: "flex-start", marginBottom: 20, marginTop: 40 },
  backText: { fontSize: 18, color: "blue" },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, width: "100%", marginBottom: 12, borderRadius: 10 },
  textarea: { borderWidth: 1, padding: 12, width: "100%", height: 120, borderRadius: 10, marginBottom: 12 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  picker: { width: "100%", marginBottom: 12 },
  imageButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginBottom: 10 },
  submitButton: { backgroundColor: "green", padding: 15, borderRadius: 10, alignItems: "center" },
  submitButtonText: { color: "white", fontWeight: "bold" },
});
