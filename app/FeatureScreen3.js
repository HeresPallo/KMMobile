import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FeatureScreen3 = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
     <Image 
         source={require("../assets/kmlogo.jpeg")} 
        style={styles.image2}
      />
      <Image 
        source={require("../assets/african-male-female-worker-show-thumbs-up-with-laptop-working-warehouse-container-cargo-ship.jpg")} 
        style={styles.image}
      />
      <Text style={styles.title}>Share your skills</Text>
      <Text style={styles.description}>Upload your CV and be part of the future workforce</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Register')} // Navigate to Register screen
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <View style={styles.pagination}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, { backgroundColor: '#f00' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
    borderRadius: 20,
  },
  image2: {
    width: 50,
    height: 50,
    marginBottom: 30,
    borderRadius: 20, // Rounded corners
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF0000'
  },
  description: {
    fontSize: 16,
    color: 'BLACK',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#ccc',
  },
});

export default FeatureScreen3;
