import { useEffect, useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, 
  TextInput, KeyboardAvoidingView, Platform, Image, ScrollView, StyleSheet, ProgressBarAndroid 
} from "react-native";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../utils/AuthContext";
import * as DocumentPicker from "expo-document-picker"; 

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function ContactsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State for Skills Submission
  const [skillsName, setSkillsName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [userSkills, setUserSkills] = useState("");

  useEffect(() => {
    // Fetch surveys
    axios.get(`${API_BASE_URL}/surveys`)
      .then(response => setSurveys(response.data))
      .catch(() => Alert.alert("Error", "Failed to load surveys."));
    setLoading(false);

    // Debugging: Check if user is available
    console.log("Logged-in User: ", user);
  }, [user]);

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf", 
          "application/msword", 
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ],
        multiple: false,
      });
  
      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("❌ User canceled document picker.");
        return;
      }
  
      const file = result.assets[0];
      let fileType = file.mimeType;
      if (fileType === "application/x-pdf") {
        fileType = "application/pdf";
      }
  
      let fileUri = file.uri;
      if (Platform.OS === "ios") {
        fileUri = file.uri.replace("file://", "");
      }
  
      setResume({
        uri: fileUri,
        name: file.name || "resume.pdf",
        type: fileType || "application/pdf",
        size: file.size
      });
  
    } catch (err) {
      console.error("❌ Error picking document:", err);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  // Submit Skills Function
  const handleSubmitSkills = async () => {
    if (!skillsName || !email || !address || !dateOfBirth || !userSkills || !resume) {
      Alert.alert("Error", "Please fill out all fields and attach a resume.");
      return;
    }
  
    if (resume && resume.size > 5 * 1024 * 1024) {
      Alert.alert("Error", "The file is too large. Please upload a file smaller than 5MB.");
      return;
    }
  
    if (resume && !["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(resume.type)) {
      Alert.alert("Error", "Invalid file type. Please upload a PDF or DOCX file.");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", skillsName);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("date_of_birth", dateOfBirth);
    formData.append("skills", userSkills);
  
    if (resume) {
      const fileUri = resume.uri.startsWith("file://") ? resume.uri.replace("file://", "") : resume.uri;
      const file = {
        uri: fileUri,
        name: resume.name,
        type: resume.type
      };
      formData.append("resume", file);
    }
  
    try {
      setUploading(true);
  
      const url = user.skillsId ? `${API_BASE_URL}/skills-directory/${user.skillsId}` : `${API_BASE_URL}/skills-directory`;
      const method = user.skillsId ? 'patch' : 'post';  

      const response = await axios[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = (progressEvent.loaded / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });
  
      console.log("✅ Success:", response.data);
      Alert.alert("Success", "Skills submitted successfully!");
    } catch (error) {
      console.error("❌ Error uploading skills:", error.response?.data || error);
      Alert.alert("Error", "Failed to submit skills.");
    } finally {
      setUploading(false);
    }
  };

  // Send Message Function (Retain the User's Phone Number)
  const handleSendMessage = async () => {
    if (!message) {
      Alert.alert("Error", "Please enter your message.");
      return;
    }
  
    setSending(true);
    try {
      await axios.post(`${API_BASE_URL}/messages`, { 
        name: user.name, 
        phone: user.phone_number, // Use user's existing phone number
        message 
      });
      Alert.alert("Success", "Message sent!");
      setMessage("");
    } catch (error) {
      Alert.alert("Error", "Failed to send message.");
    }
    setSending(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; 
      setDateOfBirth(formattedDate);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Contact Us</Text>

        {/* Buttons for each section */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SubmitSkillsScreen")}>
          <Text style={styles.buttonText}>Submit Skills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SendMessageScreen")}>
          <Text style={styles.buttonText}>Send a Message</Text>
        </TouchableOpacity>

        {/* Surveys Section */}
        <Text style={styles.sectionTitle}>Surveys</Text>
        {loading ? (
          <ActivityIndicator size="large" color="red" />
        ) : (
          <FlatList
            horizontal
            data={surveys}
            renderItem={({ item }) => (
              <View style={styles.surveyCardContainer}>
                <TouchableOpacity
                  style={styles.surveyCard}
                  onPress={() => navigation.navigate("SurveyDetails", { survey: item })}
                >
                  <Image source={require("../assets/kmlogo.jpeg")} style={styles.surveyImage} />
                  <Text style={styles.surveyTitle}>{item.title}</Text>
                  <Text style={styles.surveyDescription}>{item.description || "No description available"}</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
    color: "#333",
    textAlign: "center",
  },
  button: {
    backgroundColor: "red",
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  surveyCardContainer: {
    justifyContent: "center",
  },
  surveyCard: {
    backgroundColor: "#ff0000",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    width: 280,
    marginRight: 15,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  surveyImage: {
    width: 60,
    height: 60,
    marginBottom: 15,
    borderRadius: 10,
  },
  surveyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  surveyDescription: {
    color: "black",
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
});

