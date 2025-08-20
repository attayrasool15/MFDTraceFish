// // src/screens/Fisherman/AddTrip/components/fields/DropdownField.tsx
// import React from 'react';
// import { View, Text } from 'react-native';
// import { Controller, useFormContext } from 'react-hook-form';
// import { Dropdown } from 'react-native-element-dropdown';
// import { s } from '../../styles';
// import type { FormValues } from '../../types';

// type Props = {
//   name: keyof FormValues;
//   label: string;
//   options: string[];
//   placeholder?: string;
//   rules?: any; // allow custom rules (e.g., required)
// };

// export default function DropdownField({ name, label, options, placeholder, rules }: Props) {
//   const { control, formState: { errors } } = useFormContext<FormValues>();
//   const data = options.map(o => ({ label: o, value: o }));
//   const hasErr = !!errors[name];
//   const isRequired = !!(rules && typeof rules.required !== 'undefined');

//   return (
//     <View style={s.field}>
//       <Text style={s.label}>
//         {label}
//         {isRequired && <Text style={{ color: '#EF4444' }}> *</Text>}
//       </Text>

//       <Controller
//         name={name as any}
//         control={control}
//         rules={rules}
//         render={({ field: { onChange, value } }) => (
//           <Dropdown
//             style={[s.dropdown, hasErr && s.inputError]}
//             placeholderStyle={{ color: '#999', fontSize: 16 }}
//             selectedTextStyle={{ color: '#000', fontSize: 16 }}
//             data={data}
//             labelField="label"
//             valueField="value"
//             placeholder={placeholder ?? `Select ${label}`}
//             value={value as any}
//             onChange={item => onChange(item.value)}
//           />
//         )}
//       />

//       {hasErr && <Text style={s.errorText}>{(errors as any)[name]?.message as string}</Text>}
//     </View>
//   );
// }


// src/screens/Fisherman/AddTrip/components/fields/DropdownField.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Dropdown } from 'react-native-element-dropdown';
import { s } from '../../styles';
import type { FormValues } from '../../types';

type OptionObj = { label: string; value: string | number };

type Props = {
  name: keyof FormValues;
  label: string;
  /**
   * Accepts either:
   *  - string[] (label=value)
   *  - {label, value}[]
   */
  options: Array<string | OptionObj>;
  placeholder?: string;
  rules?: any;
  disabled?: boolean;
};

export default function DropdownField({
  name,
  label,
  options,
  placeholder,
  rules,
  disabled = false,
}: Props) {
  const { control, formState: { errors } } = useFormContext<FormValues>();

  // Normalize to {label, value}
  const data: OptionObj[] = options.map((o) =>
    typeof o === 'string' ? ({ label: o, value: o }) : o
  );

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
        render={({ field: { onChange, value } }) => (
          <Dropdown
            style={[s.dropdown, hasErr && s.inputError]}
            disable={disabled}
            placeholderStyle={{ color: '#999', fontSize: 16 }}
            selectedTextStyle={{ color: '#000', fontSize: 16 }}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={placeholder ?? `Select ${label}`}
            value={value as any}
            onChange={(item: OptionObj) => onChange(item.value)}
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
