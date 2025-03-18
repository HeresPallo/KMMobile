import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "../app/login";
import RegisterScreen from "../app/register";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import ViewNewsScreen from "../app/ViewNews";
import CreateNewsScreen from "../app/CreateNews";
import NewsScreen from "../app/News";
import EditNewsScreen from "../app/EditNews";
import SettingsScreen from "../app/settingScreen";
import FundraiserScreen from "../app/Fundraiser";
import ContactsScreen from "../app/ContactScreen";
import SurveyDetailsScreen from "../app/SurveyDetails";
import MessagesInboxScreen from "../app/MessagesInboxScreen";
import VerifyOTPScreen from "../app/VerifyOTPScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function NewsStack() {
  const NewsStackNav = createStackNavigator();
  return (
    <NewsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <NewsStackNav.Screen name="NewsScreen" component={NewsScreen} />
      <NewsStackNav.Screen name="ViewNews" component={ViewNewsScreen} />
      <NewsStackNav.Screen name="CreateNews" component={CreateNewsScreen} />
      <NewsStackNav.Screen name="EditNews" component={EditNewsScreen} />
    </NewsStackNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Settings") {
            iconName = "gear";
          } else if (route.name === "News") {
            iconName = "newspaper-o";
          } else if (route.name === "Contacts") {
            iconName = "address-book";
          } else if (route.name === "Fundraiser") {
            iconName = "money";
          }
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "red",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="News" component={NewsStack} />
      <Tab.Screen name="Fundraiser" component={FundraiserScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="Overview" component={MainTabs} options={{ gestureEnabled: false }} />
        <Stack.Screen name="SurveyDetails" component={SurveyDetailsScreen} />
        <Stack.Screen name="MessagesInbox" component={MessagesInboxScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

