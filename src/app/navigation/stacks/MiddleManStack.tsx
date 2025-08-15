// src/navigation/stacks/MiddleManStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MiddleManHome from '../../../screens/middleman/MiddleManHome';

export type MiddleManStackParamList = {
  MiddleManHome: undefined;
};

const Stack = createNativeStackNavigator<MiddleManStackParamList>();

export default function MiddleManStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MiddleManHome" component={MiddleManHome} options={{ title: 'Middle Man' }} />
    </Stack.Navigator>
  );
}
