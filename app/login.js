import { useState, useRef } from "react";
import { View, Text, TextInput, Image, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PhoneInput from "react-native-phone-number-input";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function LoginScreen() {
  const navigation = useNavigation();
  const phoneInput = useRef(null);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!formattedPhoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }
    try {
      // Use the formatted phone number which includes the country code
      const response = await axios.post(`${API_BASE_URL}/mobile/login`, {
        phone_number: formattedPhoneNumber,
        password,
      });

      // Save token and user data to AsyncStorage
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("user_id", response.data.user_id.toString());
      await AsyncStorage.setItem("role", response.data.role);
      await AsyncStorage.setItem("phone_number", formattedPhoneNumber);

      navigation.navigate("Overview");
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      Alert.alert("Login Failed", "Invalid phone number or password.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF", padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#000000" }}>People</Text>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FF0000" }}>First</Text>
      </View>
      <Image source={require("../assets/kmlogo.jpeg")} style={{ width: 120, height: 120, marginBottom: 20 }} />
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#343a40" }}>Login</Text>
      
      {/* Phone Number Input with Sierra Leone as the default country */}
      <PhoneInput
        ref={phoneInput}
        defaultCode="SL"  // Sierra Leone
        layout="first"
        onChangeText={(text) => setPhoneNumber(text)}
        onChangeFormattedText={(formatted) => setFormattedPhoneNumber(formatted)}
        containerStyle={{ width: "90%", marginBottom: 10 }}
      />

      {/* Password Input */}
      <TextInput 
        placeholder="Password" 
        secureTextEntry 
        onChangeText={setPassword} 
        value={password}
        autoCorrect={false}
        style={{ backgroundColor: "white", borderWidth: 1, borderColor: "#ced4da", padding: 12, width: "90%", borderRadius: 10, marginBottom: 10 }}
      />

      <TouchableOpacity 
        onPress={handleLogin} 
        style={{ backgroundColor: "#FF0000", padding: 15, borderRadius: 12, width: "90%", alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Log In</Text>
      </TouchableOpacity>

      {/* Already have an account? */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 20 }}>
        <Text style={{ color: "#000000", fontSize: 16, fontWeight: "bold" }}>
        No account? Sign Up here
        </Text>
      </TouchableOpacity>
    </View>
  );
}
