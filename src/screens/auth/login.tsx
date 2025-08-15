// src/screens/auth/Login.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Button,
  Image,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useDispatch, useSelector } from 'react-redux';
import type { Dispatch } from 'redux';
import { login } from '../../redux/actions/authActions';
import type { AuthAction } from '../../redux/types';
import { RootState } from '../../redux/store';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { RootStackParamList } from '../../../types';

type loginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const navigation = useNavigation<loginScreenNavigationProp>();

  // Redux
  const dispatch = useDispatch<Dispatch<AuthAction>>();
  const { loading, error } = useSelector((s: RootState) => s.auth);

  // Local UI state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Keyboard-safe helpers
  const scrollRef = useRef<ScrollView>(null);
  const [emailY, setEmailY] = useState(0);
  const [passwordY, setPasswordY] = useState(0);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const imgSize = Math.min(width * 0.7, 320);

  const scrollTo = (y: number) => {
    // Scroll the focused field near the top with some margin
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
  };

  const onFocus =
    (yGetter: () => number) =>
    (_e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      // Delay ensures layout is measured after focus
      requestAnimationFrame(() => scrollTo(yGetter()));
    };

  const handleLogin = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      valid = false;
    }

    if (!valid) return;

    // Dispatch classic Redux actions (no thunk)
    login(email.trim(), password).forEach(a => dispatch(a));
    // RootNavigator will switch stack on success.
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 10 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../assets/images/MFD.png')}
            style={[styles.image, { width: imgSize, height: imgSize }]}
            resizeMode="contain"
          />

          <View style={styles.formContainer}>
            <View style={styles.loginHeader}>
              <Text style={styles.loginText}>Enter Login Details</Text>
            </View>

            <View style={styles.loginBox}>
              {/* Email Input */}
              <View
                onLayout={e => setEmailY(e.nativeEvent.layout.y)}
              >
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  placeholderTextColor="#999999"
                  returnKeyType="next"
                  onFocus={onFocus(() => emailY)}
                />
                {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}
              </View>

              {/* Password Input */}
              <View
                onLayout={e => setPasswordY(e.nativeEvent.layout.y)}
              >
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#999999"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={onFocus(() => passwordY)}
                />
                {passwordError !== '' && <Text style={styles.errorText}>{passwordError}</Text>}
              </View>

              {/* Global auth error from Redux */}
              {!!error && <Text style={styles.authError}>{error}</Text>}

              {/* Remember me and Forgot password */}
              <View style={styles.rememberRow}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>Keep me logged in</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Alert.alert('Forgot password pressed')}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Buttons */}
              <View style={styles.buttonColumn}>
                <View style={{ flex: 1, marginRight: 5, padding: 5 }}>
                  <Button
                    title={loading ? 'Loading...' : 'LOGIN'}
                    onPress={handleLogin}
                    color="#1f720dff"
                    disabled={loading}
                  />
                </View>
                <View style={{ flex: 1, marginRight: 5, padding: 5 }}>
                  <Button
                    title="Create New Account"
                    onPress={() => {
                      setEmail('');
                      setPassword('');
                      navigation.navigate('SignUp');
                    }}
                    color="#000000"
                    disabled={loading}
                  />
                </View>
              </View>

              {/* Demo creds hint */}
              <Text style={{ marginTop: 10, fontSize: 12, color: '#555' }}>
                Demo: fish@demo.com / mid@demo.com / exp@demo.com / mfd@demo.com — password: 123456
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#ffffffff',
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loginBox: {
    backgroundColor: '#ffffffff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#000000ff',
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20, height: 20, borderWidth: 1, borderColor: '#000000ff',
    borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  checkedBox: { backgroundColor: '#ffffffff', borderColor: '#49650fff' },
  checkmark: { color: '#000000ff', fontSize: 12 },
  rememberText: { color: '#000000ff', fontSize: 12, fontWeight: 'bold' },
  forgotPassword: { color: '#000000ff', fontSize: 12, fontWeight: 'bold' },
  buttonColumn: { flexDirection: 'column' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 8, marginTop: -5, marginLeft: 4 },
  authError: { color: 'red', fontSize: 13, marginTop: 4, marginBottom: 8, textAlign: 'center' },
  loginText: { color: '#ffffffff', fontSize: 16, fontWeight: 'bold' },
  loginHeader: {
    backgroundColor: '#1f720dff',
    paddingVertical: 15,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image: {
    alignSelf: 'center',
    margin: 70,
    marginTop: -10,
    marginBottom: 18,
  },
});

export default Login;
