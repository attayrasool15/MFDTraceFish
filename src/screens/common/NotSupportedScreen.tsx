// src/screens/common/NotSupportedScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function NotSupportedScreen() {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text>Role not supported.</Text>
    </View>
  );
}
