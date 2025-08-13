// src/screens/Fisherman/FishermanHomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function FishermanHomeScreen() {
  return (
    <View style={styles.c}><Text style={styles.t}>Fisherman Dashboard</Text></View>
  );
}
const styles = StyleSheet.create({ c:{flex:1,justifyContent:'center',alignItems:'center'}, t:{fontSize:18} });
