import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';
import { s } from '../styles';

type Rules = Parameters<typeof Controller>[0]['rules'];

export function TextField({
  name, label, placeholder, rules,
}: { name: string; label: string; placeholder?: string; rules?: Rules }) {
  const { control, formState: { errors } } = useFormContext();
  const err = (errors as any)[name]?.message as string | undefined;
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Controller
        control={control}
        name={name as any}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[s.input, err && s.inputError]}
            placeholder={placeholder}
            placeholderTextColor="#999"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {!!err && <Text style={s.helperText}>{err}</Text>}
    </View>
  );
}

export function NumberField({
  name, label, placeholder, rules,
}: { name: string; label: string; placeholder?: string; rules?: Rules }) {
  const { control, formState: { errors } } = useFormContext();
  const err = (errors as any)[name]?.message as string | undefined;
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Controller
        control={control}
        name={name as any}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[s.input, err && s.inputError]}
            placeholder={placeholder}
            placeholderTextColor="#999"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="decimal-pad"
          />
        )}
      />
      {!!err && <Text style={s.helperText}>{err}</Text>}
    </View>
  );
}
