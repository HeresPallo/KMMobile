import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, KeyboardAvoidingView, Platform, StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/mobileusers";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: "",
    phone_number: "",
    password: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await AsyncStorage.getItem("user_id");
      const token = await AsyncStorage.getItem("token");

      if (!userId || !token) {
        Alert.alert("Error", "User not found. Please log in again.");
        navigation.replace("Login");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData({
          name: response.data.name || "",
          phone_number: response.data.phone_number || "",
          password: "", // Keep password empty for security
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("user_id");

    if (!token || !userId) {
      Alert.alert("Error", "User not found. Please log in again.");
      navigation.replace("Login");
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo */}
        <Image 
          source={require("../assets/kmlogo.jpeg")} 
          style={styles.logo}
        />

        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subHeader}>
          Update your profile details and manage your account.
        </Text>

        <View style={styles.divider} />

        {/* Name Input */}
        <TextInput
          placeholder="Full Name"
          value={userData.name}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
          style={styles.input}
        />

        {/* Phone Number Input */}
        <TextInput
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={userData.phone_number}
          onChangeText={(text) => setUserData({ ...userData, phone_number: text })}
          style={styles.input}
        />

        {/* Password Input */}
        <TextInput
          placeholder="New Password"
          secureTextEntry
          value={userData.password}
          onChangeText={(text) => setUserData({ ...userData, password: text })}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleUpdate}
          style={styles.updateButton}
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 20,
    textAlign: "center",
  },
  divider: {
    width: "90%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 20,
  },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "white",
    elevation: 3,
  },
  updateButton: {
    width: "90%",
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  logoutButton: {
    width: "90%",
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
