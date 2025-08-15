// src/screens/Fisherman/AddTrip/components/fields/DropdownField.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Dropdown } from 'react-native-element-dropdown';
import { s } from '../../styles';
import type { FormValues } from '../../types';

type Props = {
  name: keyof FormValues;
  label: string;
  options: string[];
};

export default function DropdownField({ name, label, options }: Props) {
  const {
    control,
    formState: { errors },
  } = useFormContext<FormValues>();
  const data = options.map(o => ({ label: o, value: o }));
  const hasErr = !!errors[name];
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <Controller
        name={name as any}
        control={control}
        rules={{ required: `${label} is required` }}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            style={[s.dropdown, hasErr && s.inputError]}
            placeholderStyle={{ color: '#999', fontSize: 16 }}
            selectedTextStyle={{ color: '#000', fontSize: 16 }}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={`Select ${label}`}
            value={value as any}
            onChange={item => onChange(item.value)}
          />
        )}
      />
      {hasErr && (
        <Text style={s.errorText}>
          {(errors as any)[name]?.message as string}
        </Text>
      )}
    </View>
  );
}
