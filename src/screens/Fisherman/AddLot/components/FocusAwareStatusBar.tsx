import React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

type Props = StatusBarProps & { backgroundColor?: string };

export default function FocusAwareStatusBar(props: Props) {
  const isFocused = useIsFocused();
  if (!isFocused) return null;
  return <StatusBar {...props} />;
}