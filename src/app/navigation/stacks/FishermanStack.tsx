// src/navigation/stacks/FishermanStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FishermanHome from '../../../screens/Fisherman/FishermanHome';
import AddLotScreen from '../../../screens/Fisherman/AddLotScreen';
import AddTripScreen from '../../../screens/Fisherman/AddTrip';

export type FishermanStackParamList = {
  FishermanHome: undefined;
  Trip: undefined;
  Lots: { tripId: string };
};

const Stack = createNativeStackNavigator<FishermanStackParamList>();

export default function FishermanStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,                 // 👈 hide the native header
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="FishermanHome" component={FishermanHome} />
      <Stack.Screen name="Trip" component={AddTripScreen} />
      <Stack.Screen name="Lots" component={AddLotScreen} />
    </Stack.Navigator>
  );
}
