import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../../screens/Auth/LoginScreen';
import RegisterScreen from '../../../screens/Auth/RegisterScreen';


export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
    </Stack.Navigator>
  );
}
