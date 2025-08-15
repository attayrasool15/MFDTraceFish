import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { s } from '../styles';

export default function SaveBar({
  label, disabled, onPress,
}: { label: string; disabled?: boolean; onPress: () => void }) {
  return (
    <View style={[s.saveBar, disabled && s.saveBarDisabled]}>
      <TouchableOpacity onPress={onPress} disabled={disabled} style={{ width: '100%', alignItems: 'center' }}>
        <Text style={s.saveBarText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}
