import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Platform, Image, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from "react-native";
import axios from "axios";
import { useAuth } from "../utils/AuthContext";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function SubmitSkillsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [skillsName, setSkillsName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");

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
        return;
      }

      const file = result.assets[0];
      setResume({
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to pick document.");
    }
  };

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
  
      // Make sure to navigate to the right screen
      navigation.goBack(); // Replace "ContactsScreen" with the correct screen name in your navigator
    } catch (error) {
      console.error("❌ Error uploading skills:", error.response?.data || error);
      Alert.alert("Error", "Failed to submit skills.");
    } finally {
      setUploading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; 
      setDateOfBirth(formattedDate);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Image source={require("../assets/kmlogo.jpeg")} style={styles.logo} />

          <Text style={styles.sectionTitle}>Submit Skills</Text>

          <TextInput 
            placeholder="Full Name" 
            value={skillsName} 
            onChangeText={setSkillsName} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Email Address" 
            value={email} 
            onChangeText={setEmail} 
            style={styles.input} 
            keyboardType="email-address" 
          />
          <TextInput 
            placeholder="Address" 
            value={address} 
            onChangeText={setAddress} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Skills" 
            value={userSkills} 
            onChangeText={setUserSkills} 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
            multiline 
          />

          {/* Date Picker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
            <Text style={dateOfBirth ? styles.dateText : styles.placeholderText}>
              {dateOfBirth || "Select Date of Birth"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}

          {/* Resume Upload */}
          <TouchableOpacity onPress={pickResume} style={styles.button}>
            <Text style={styles.buttonText}>{resume ? "✅ Resume Selected" : "📂 Upload Resume (PDF/DOC)"}</Text>
          </TouchableOpacity>

          {/* Submit Skills */}
          <TouchableOpacity onPress={handleSubmitSkills} style={styles.button}>
            <Text style={styles.buttonText}>{uploading ? "Uploading..." : "Submit Skills"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: "red",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  datePicker: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#aaa",
  },
});
