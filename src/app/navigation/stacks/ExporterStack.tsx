// src/navigation/stacks/ExporterStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExporterHome from '../../../screens/exporter/ExporterHome';

export type ExporterStackParamList = {
  ExporterHome: undefined;
};

const Stack = createNativeStackNavigator<ExporterStackParamList>();

export default function ExporterStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ExporterHome" component={ExporterHome} options={{ title: 'Exporter' }} />
    </Stack.Navigator>
  );
}
