import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function VerifyOTPScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // Retrieve phone and email passed from RegisterScreen
  const { phone_number, email } = route.params;
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/mobile/verify-otp`, {
        phone_number: phone_number,
        otp_code: otp,
        email: email,
      });
      if (response.status === 200) {
        Alert.alert("Success", "OTP verified, registration complete");
        // Navigate to Login or Home screen as appropriate
        navigation.replace("Login");
      } else {
        Alert.alert("Error", "Invalid OTP, please try again");
      }
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>Verify OTP</Text>
      <TextInput 
        placeholder="Enter OTP" 
        keyboardType="number-pad"
        onChangeText={setOtp} 
        value={otp} 
        style={{ borderWidth: 1, padding: 12, width: "90%", borderRadius: 10, marginBottom: 10 }}
      />
      <TouchableOpacity 
        onPress={handleVerifyOTP} 
        style={{ backgroundColor: "green", padding: 15, borderRadius: 12, width: "90%", alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
