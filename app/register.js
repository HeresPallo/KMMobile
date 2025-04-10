import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import PhoneInput from 'react-native-phone-number-input';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(["Support for defaultProps will be removed"]); // Suppress warning

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function RegisterScreen() {
  const navigation = useNavigation();

  // State variables for the registration form
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    // Basic validation
    if (!name || !formattedPhoneNumber || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      // Call the backend registration endpoint
      const response = await axios.post(`${API_BASE_URL}/mobile/register`, {
        name,
        phone_number: formattedPhoneNumber,
        password,
      });

      // Expecting a 201 status code for successful registration
      if (response.status === 201) {
        Alert.alert("Success", "Registration successful. Please log in.");
        // Navigate to Login screen after registration
        navigation.replace("Login");
      } else {
        Alert.alert("Error", "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "Registration error. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#000000" }}>Our New</Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FF0000" }}> Hope</Text>
        </View>
        <Image source={require("../assets/kmlogo.jpeg")} style={{ width: 120, height: 120, marginBottom: 20 }} />
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>Create Account</Text>
        
        {/* Full Name Input */}
        <TextInput
          placeholder="Full Name"
          onChangeText={setName}
          value={name}
          autoCorrect={false}
          autoCapitalize='none'
          style={{ borderWidth: 1, padding: 12, width: "90%", borderRadius: 10, marginBottom: 10 }}
        />

        {/* Phone Number Input */}
        <PhoneInput
          defaultCode="US" // Adjust as needed
          layout="first"
          onChangeText={(text) => setPhoneNumber(text)}
          onChangeFormattedText={(formatted) => setFormattedPhoneNumber(formatted)}
          withShadow
          containerStyle={{ width: "90%", marginBottom: 10 }}
        />

        {/* Password Input */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          autoCorrect={false}
          style={{ borderWidth: 1, padding: 12, width: "90%", borderRadius: 10, marginBottom: 10 }}
        />

        {/* Confirm Password Input */}
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          autoCorrect={false}
          style={{ borderWidth: 1, padding: 12, width: "90%", borderRadius: 10, marginBottom: 20 }}
        />

        <TouchableOpacity
          onPress={handleRegister}
          style={{ backgroundColor: "#FF0000", padding: 15, borderRadius: 12, width: "90%", alignItems: "center" }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Register</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 20 }}>
          <Text style={{ color: "#000000", fontSize: 16, fontWeight: "bold" }}>
            Already have an account? Log in here
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
