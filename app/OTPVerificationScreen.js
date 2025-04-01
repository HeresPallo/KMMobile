import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  // Retrieve userId and verificationId passed from the registration screen
  const { userId, verificationId } = route.params;

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/mobile/verify-otp`, {
        userId,
        verificationId,
        otp,
      });
      if (response.status === 200) {
        Alert.alert("Success", "Your phone number has been verified.");
        // Navigate to Login (or another screen as needed)
        navigation.replace("Login");
      } else {
        Alert.alert("Error", "OTP verification failed. Please try again.");
      }
    } catch (error) {
      console.error("OTP Verification error:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "OTP verification error. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#CED4DA",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 12,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
