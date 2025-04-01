import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Image } from "react-native";
import axios from "axios";
import { useAuth } from "../utils/AuthContext";
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function SendMessageScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Handle sending the message
  const handleSendMessage = async () => {
    if (!message) {
      Alert.alert("Error", "Please enter your message.");
      return;
    }

    setSending(true);
    try {
      // Send the message to the backend
      await axios.post(`${API_BASE_URL}/messages`, {
        name: user?.name, 
        phone: user?.phone_number, // Using the logged-in user's phone number
        message 
      });
      Alert.alert("Success", "Message sent!");
      setMessage("");  // Clear message input after sending
    } catch (error) {
      Alert.alert("Error", "Failed to send message.");
    }
    setSending(false);
  };

  return (
    <View style={styles.container}>
    
      
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

        {/* KM Logo at the top */}
        <Image 
        source={require("../assets/kmlogo.jpeg")} 
        style={styles.logo}
      />

<Text style={styles.sectionTitle}>Send Message</Text>


      {/* Message Input */}
      <TextInput 
        placeholder="Write your message..." 
        value={message} 
        onChangeText={setMessage} 
        style={[styles.input, {height: 100}]} 
        multiline 
      />

      {/* Send Button */}
      <TouchableOpacity onPress={handleSendMessage} style={styles.button}>
        <Text style={styles.buttonText}>{sending ? "Sending..." : "Send Message"}</Text>
      </TouchableOpacity>

      {/* View Messages Inbox Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("MessagesInbox", { phone_number: user?.phone_number })}
        style={styles.inboxButton}
      >
        <Text style={styles.inboxButtonText}>📥 View Messages Inbox</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa", // Light background color for smooth UX
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: "blue",
    textAlign: "left",
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
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#ff0000", // Red button to match your color scheme
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inboxButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 10,
    alignItems: "center",
  },
  inboxButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
