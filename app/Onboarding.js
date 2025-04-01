import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import FeatureScreen1 from './FeatureScreen1';
import FeatureScreen2 from './FeatureScreen2';
import FeatureScreen3 from './FeatureScreen3';
import RegisterScreen from "../app/register";

const Stack = createStackNavigator();

export default function Onboarding() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeatureScreen1" component={FeatureScreen1} />
      <Stack.Screen name="FeatureScreen2" component={FeatureScreen2} />
      <Stack.Screen name="FeatureScreen3" component={FeatureScreen3} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
