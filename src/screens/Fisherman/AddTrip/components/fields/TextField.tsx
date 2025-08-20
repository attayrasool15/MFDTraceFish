// src/screens/Fisherman/AddTrip/components/fields/TextField.tsx
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { s } from '../../styles';
import type { FormValues } from '../../types';

type Props = {
  name: keyof FormValues;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'phone-pad' | 'email-address';
  secureTextEntry?: boolean;
  rules?: any;
};

export default function TextField({
  name,
  label,
  placeholder,
  keyboardType,
  secureTextEntry,
  rules,
}: Props) {
  const { control, formState: { errors } } = useFormContext<FormValues>();
  const hasErr = !!errors[name];
  const isRequired = !!(rules && typeof rules.required !== 'undefined');

  return (
    <View style={s.field}>
      <Text style={s.label}>
        {label}
        {isRequired && <Text style={{ color: '#EF4444' }}> *</Text>}
      </Text>

      <Controller
        name={name as any}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[s.input, hasErr && s.inputError]}
            placeholder={placeholder}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value as any}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
          />
        )}
      />

      {hasErr && <Text style={s.errorText}>{(errors as any)[name]?.message as string}</Text>}
    </View>
  );
}
