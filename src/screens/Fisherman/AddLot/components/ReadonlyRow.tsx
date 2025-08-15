import React from 'react';
import { View, Text } from 'react-native';
import { s } from '../styles';

export function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.readonlyRow}>
      <Text style={s.readonlyLabel}>{label}</Text>
      <Text style={s.readonlyValue}>{value}</Text>
    </View>
  );
}
