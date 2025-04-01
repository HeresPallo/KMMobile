import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Redirect after 2 seconds to Onboarding Screens
    setTimeout(() => {
      navigation.replace('Onboarding'); // Navigate to the Onboarding flow
    }, 2000); // Adjust the duration as needed
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/kmlogo.jpeg")} style={styles.logo} />
      <Text style={styles.appName}>Our New Hope App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
