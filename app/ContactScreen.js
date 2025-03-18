import { useEffect, useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, 
  TextInput, KeyboardAvoidingView, Platform, Image, ScrollView, StyleSheet 
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com"; // Production API URL

export default function ContactsScreen() {
  const navigation = useNavigation();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Message Section State
  const [messageName, setMessageName] = useState("");
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sending, setSending] = useState(false);

  // Skills Section State
  const [skillsName, setSkillsName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [skills, setSkills] = useState([]); // To store refreshed skills list if needed

  useEffect(() => {
    axios.get(`${API_BASE_URL}/surveys`)
      .then((response) => {
        setSurveys(response.data);
      })
      .catch(() => Alert.alert("Error", "Failed to load surveys."));
    setLoading(false);
  }, []);

  // Submit message to admin
  const handleSendMessage = async () => {
    if (!phoneNumber || !message) {
      Alert.alert("Error", "Please enter your phone number and message.");
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API_BASE_URL}/messages`, { 
        name: messageName, 
        phone: phoneNumber, 
        message 
      });
      Alert.alert("Success", "Message sent!");
      setMessage("");
      setPhoneNumber("");
      setMessageName("");
    } catch (error) {
      Alert.alert("Error", "Failed to send message.");
    }
    setSending(false);
  };

  // Submit skills
  const handleSubmitSkills = async () => {
    if (!skillsName || !email || !address || !dateOfBirth || !userSkills) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/skills-directory`, {
        name: skillsName,
        email,
        address,
        date_of_birth: dateOfBirth,
        skills: userSkills,
      });

      Alert.alert("Success", "Skills submitted successfully!");
      setSkillsName("");
      setEmail("");
      setAddress("");
      setDateOfBirth("");
      setUserSkills("");

      // Refresh skills list if needed
      axios.get(`${API_BASE_URL}/skills-directory`).then((response) => setSkills(response.data));
    } catch (error) {
      Alert.alert("Error", "Failed to submit skills.");
    }
  };

  // Render a survey card
  const renderSurveyCard = ({ item }) => (
    <View style={styles.surveyCardContainer}>
      <TouchableOpacity
        style={styles.surveyCard}
        onPress={() => navigation.navigate("SurveyDetails", { survey: item })}
      >
        <Image 
          source={require("../assets/kmlogo.jpeg")} 
          style={styles.surveyImage} 
        />
        <Text style={styles.surveyTitle}>
          {item.title}
        </Text>
        <Text style={styles.surveyDescription}>
          {item.description || "No description available"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Surveys Section */}
        <Text style={styles.sectionTitle}>Surveys</Text>
        {loading ? (
          <ActivityIndicator size="large" color="red" />
        ) : (
          <FlatList
            horizontal
            data={surveys}
            renderItem={renderSurveyCard}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        )}

        <View style={styles.divider} />

        {/* Messages Section */}
        <Text style={styles.sectionTitle}>Send a Message</Text>
        <TextInput 
          placeholder="Enter your name" 
          value={messageName} 
          onChangeText={setMessageName} 
          style={styles.input} 
          autoCorrect={false} 
          autoCapitalize="none" 
        />
        <TextInput 
          placeholder="Enter your phone number" 
          keyboardType="phone-pad" 
          value={phoneNumber} 
          onChangeText={setPhoneNumber} 
          style={styles.input}  
          autoCorrect={false} 
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Write your message..." 
          multiline 
          numberOfLines={5} 
          textAlignVertical="top" 
          value={message} 
          onChangeText={setMessage} 
          style={styles.textarea}  
          autoCorrect={false} 
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.button}>
          <Text style={styles.buttonText}>{sending ? "Sending..." : "Send Message"}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Skills Directory Form */}
        <Text style={styles.sectionTitle}>Submit Your Skills</Text>
        <TextInput 
          placeholder="Full Name" 
          value={skillsName} 
          onChangeText={setSkillsName} 
          style={styles.input} 
          autoCorrect={false} 
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Email Address" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          style={styles.input} 
          autoCorrect={false} 
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Address" 
          value={address} 
          onChangeText={setAddress} 
          style={styles.input} 
          autoCorrect={false} 
          autoCapitalize="none" 
        />
        <TextInput 
          placeholder="Date of Birth (YYYY-MM-DD)" 
          value={dateOfBirth} 
          onChangeText={setDateOfBirth} 
          keyboardType="numeric" 
          style={styles.input} 
          autoCorrect={false} 
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Enter your skills (e.g., Web Development, Marketing, Finance)" 
          multiline 
          numberOfLines={3} 
          textAlignVertical="top" 
          value={userSkills} 
          onChangeText={setUserSkills} 
          style={styles.textarea} 
          autoCorrect={false} 
          autoCapitalize="none" 
        />
        <TouchableOpacity onPress={handleSubmitSkills} style={styles.button}>
          <Text style={styles.buttonText}>Submit Skills</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Messages Inbox Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("MessagesInbox")}
          style={styles.inboxButton}
        >
          <Text style={styles.inboxButtonText}>📥 View Messages Inbox</Text>
        </TouchableOpacity>
       
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    minHeight: 100,
    marginBottom: 10,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  inboxButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  inboxButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // New styles for survey card
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
  // Styled buttons
  button: {
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
