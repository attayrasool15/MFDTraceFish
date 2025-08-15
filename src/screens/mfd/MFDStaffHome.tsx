// src/screens/mfd/MFDStaffHome.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/actions/authActions';

export default function MFDStaffHome() {
  const dispatch = useDispatch();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>MFD Staff Dashboard</Text>
      <Button title="Logout" onPress={() => dispatch(logout())} />
    </View>
  );
}
