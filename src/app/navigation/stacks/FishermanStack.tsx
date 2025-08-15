// src/navigation/stacks/FishermanStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FishermanHome from '../../../screens/Fisherman/FishermanHome';

export type FishermanStackParamList = {
  FishermanHome: undefined;
};

const Stack = createNativeStackNavigator<FishermanStackParamList>();

export default function FishermanStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FishermanHome" component={FishermanHome} options={{ title: 'Fisherman' }} />
    </Stack.Navigator>
  );
}
