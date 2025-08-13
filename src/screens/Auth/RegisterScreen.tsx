import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerAction } from '../../redux/actions/authActions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../app/navigation/stacks/AuthStack';
import { RootState } from '../../redux/store';

interface FormValues { name: string; email: string; password: string; confirmPassword: string; role?: string; }

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useDispatch<any>();
  const { loading, error } = useSelector((s: RootState) => s.auth);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: '' },
  });

  const onSubmit = (values: FormValues) => {
    if (values.password !== values.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    const payload = { name: values.name.trim(), email: values.email.trim(), password: values.password, role: values.role?.trim() || undefined };
    dispatch(registerAction(payload) as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <View style={styles.field}> 
        <Text style={styles.label}>Full name</Text>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.name && styles.inputError]} placeholder="Abdul Wahab" onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
      </View>

      <View style={styles.field}> 
        <Text style={styles.label}>Email</Text>
        <Controller
          name="email"
          control={control}
          rules={{ required: 'Email is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
      </View>

      <View style={styles.field}> 
        <Text style={styles.label}>Password</Text>
        <Controller
          name="password"
          control={control}
          rules={{ required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.password && styles.inputError]} placeholder="••••••••" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      </View>

      <View style={styles.field}> 
        <Text style={styles.label}>Confirm password</Text>
        <Controller
          name="confirmPassword"
          control={control}
          rules={{ required: 'Please confirm password' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.confirmPassword && styles.inputError]} placeholder="••••••••" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
      </View>

      <View style={styles.field}> 
        <Text style={styles.label}>Role (optional for now)</Text>
        <Controller
          name="role"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} placeholder="FISHERMAN / AUCTIONEER / EXPORTER / MFD" autoCapitalize="characters" onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 24, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  inputError: { borderColor: '#d00' },
  errorText: { color: '#d00', marginTop: 6, fontSize: 12 },
  button: { backgroundColor: '#0A84FF', height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkText: { textAlign: 'center', marginTop: 16, color: '#0A84FF' },
});