import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TextInput, Button, Alert } from "react-native";
import axios from "axios";

const API_BASE_URL = "http://localhost:5001"; // ✅ Replace with your backend URL

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      await AsyncStorage.setItem("token", response.data.token);
      navigation.replace("Overview");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Login</Text>
      <TextInput 
        placeholder="Email" 
        onChangeText={setEmail} 
        value={email} 
        style={{ borderWidth: 1, padding: 10, width: "100%", marginBottom: 10 }}
      />
      <TextInput 
        placeholder="Password" 
        secureTextEntry 
        onChangeText={setPassword} 
        value={password} 
        style={{ borderWidth: 1, padding: 10, width: "100%" }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}