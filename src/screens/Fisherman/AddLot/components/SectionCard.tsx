import React, { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';
import { s } from '../styles';

export default function SectionCard({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={s.sectionSubtitle}>{subtitle}</Text>}
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}
