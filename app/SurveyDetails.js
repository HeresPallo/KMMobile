import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, TouchableWithoutFeedback, Keyboard 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"; // Import for scroll view handling

// Update this URL to your production endpoint
const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com";

export default function SurveyDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { survey } = route.params;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState({});

  const handleInputChange = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and email are required.");
      return;
    }

    // Format the answers array from the survey questions.
    const formattedAnswers = survey.questions.map(q => ({
      question: q,
      answer: answers[q] || "No response",
    }));

    try {
      await axios.post(`${API_BASE_URL}/surveyresponses`, {
        name,
        email,
        answers: formattedAnswers,
        survey_id: survey.id, // Link response to survey
      });
      Alert.alert("Success", "Survey submitted successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting survey:", error.response?.data || error);
      Alert.alert("Error", "Failed to submit survey.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      {/* Wrap everything in a single parent */}
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled" // Allow taps to dismiss the keyboard
        extraScrollHeight={20} // Allow space for the keyboard
      >
        <View style={styles.innerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{survey.title}</Text>
          <Text style={styles.description}>
            {survey.description || "No description available"}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput 
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              autoCorrect={false}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Email</Text>
            <TextInput 
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              autoCorrect={false}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {survey.questions.map((q, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.questionText}>{q}</Text>
              <TextInput 
                style={styles.answerInput}
                placeholder="Enter your answer"
                value={answers[q] || ""}
                autoCorrect={false}
                onChangeText={(text) => handleInputChange(q, text)}
              />
            </View>
          ))}

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Survey</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
    marginTop: 40,
  },
  backButtonText: {
    fontSize: 18,
    color: "blue",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  questionContainer: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
