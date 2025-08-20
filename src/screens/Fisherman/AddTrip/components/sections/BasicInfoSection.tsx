/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import TextField from '../fields/TextField';
import DropdownField from '../fields/DropdownField';
import { useFormContext } from 'react-hook-form';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { fetchFishermenList, type Fisherman } from '../../../../../services/fisherman';

const TRIP_TYPE_OPTIONS = [
  'Fishing Trip',
  'Transport Trip',
  'Inspection Trip',
  'Patrol Trip',
  'Research Trip',
];

/* ---------- small helpers ---------- */
const pad = (n: number) => String(n).padStart(2, '0');
export const formatYmd12h = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hh = pad(h);
  return `${yyyy}-${mm}-${dd} ${hh}:${m} ${ampm}`;
};
export const parseYmd12h = (s?: string) => {
  if (!s) return new Date();
  const re = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?$/i;
  const m = re.exec(s.trim());
  if (!m) return new Date();
  const [, ys, ms, ds, hs, mins, ap] = m;
  const y = parseInt(ys, 10);
  const mo = parseInt(ms, 10) - 1;
  const d = parseInt(ds, 10);
  let H = 0, Mi = 0;
  if (hs && mins && ap) {
    let h12 = parseInt(hs, 10) % 12;
    if (/pm/i.test(ap)) h12 += 12;
    H = h12;
    Mi = parseInt(mins, 10);
  }
  const dt = new Date(y, mo, d, H, Mi);
  return isNaN(dt.getTime()) ? new Date() : dt;
};

export default function BasicInfoSection() {
  const [loading, setLoading] = useState(false);
  const [fishermen, setFishermen] = useState<Fisherman[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { watch, setValue } = useFormContext();
  const departureDT: string = watch('departure_time'); // "YYYY-MM-DD hh:mm AM/PM"

  // default departure_time → now (formatted)
  useEffect(() => {
    if (!departureDT) {
      setValue('departure_time', formatYmd12h(new Date()), {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [departureDT, setValue]);

  // fetch fishermen (single, auth)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFishermenList();
        if (!cancelled) setFishermen(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load fishermen');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // build dropdown options: show name, store id
  const fisherOptions = useMemo(
    () => fishermen.map(f => ({ label: f.name, value: f.id })),
    [fishermen]
  );

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed') return;
    const current = parseYmd12h(departureDT);
    const picked = date ?? current;
    const merged = new Date(
      picked.getFullYear(),
      picked.getMonth(),
      picked.getDate(),
      current.getHours(),
      current.getMinutes(),
    );
    setValue('departure_time', formatYmd12h(merged), { shouldValidate: true, shouldDirty: true });
  };

  const onChangeTime = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'dismissed') return;
    const current = parseYmd12h(departureDT);
    const picked = date ?? current;
    const merged = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate(),
      picked.getHours(),
      picked.getMinutes(),
    );
    setValue('departure_time', formatYmd12h(merged), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <>
      {/* Fisherman (Dropdown) — shows name, saves numeric id */}
      <DropdownField
        name="fisherman"                     // value in form will be the fisherman id
        label="Fisherman"
        options={fisherOptions}              // {label: name, value: id}
        placeholder={
          loading ? 'Loading…' : (error ? 'Failed — try again' : 'Select Fisherman')
        }
        disabled={loading}
        rules={{ required: 'fisher name is required' }}
      />

      {/* Departure Date & Time (YYYY-MM-DD hh:mm AM/PM) */}
      <View style={{ marginTop: 12 }}>
        <TextField
          name="departure_time"
          label="Departure (Date & Time)"
          placeholder="YYYY-MM-DD hh:mm AM/PM"
          rules={{
            required: 'Departure date & time is required',
            pattern: {
              value: /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s?(AM|PM)$/i,
              message: 'Use YYYY-MM-DD hh:mm AM/PM',
            },
          }}
        />

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                backgroundColor: '#FFFFFF',
              },
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Pick date"
          >
            <Text style={{ fontWeight: '800', color: '#1B5E20' }}>Pick Date</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                backgroundColor: '#FFFFFF',
              },
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Pick time"
          >
            <Text style={{ fontWeight: '800', color: '#1B5E20' }}>Pick Time</Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={parseYmd12h(departureDT)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={parseYmd12h(departureDT)}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
          />
        )}

        {Platform.OS === 'ios' && (showDatePicker || showTimePicker) ? (
          <Pressable
            onPress={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}
            style={({ pressed }) => [
              {
                marginTop: 8,
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                backgroundColor: '#FFFFFF',
              },
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close pickers"
          >
            <Text style={{ fontWeight: '800', color: '#1B5E20' }}>Done</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Boat ID */}
      <TextField
        name="boatNameId"
        label="Boat ID"
        placeholder="eg. PK-001"
        rules={{ required: 'Boat name or ID are required' }}
      />

      {/* Trip Type */}
      <DropdownField
        name="tripType"
        label="Trip Type"
        options={TRIP_TYPE_OPTIONS}   // string[]
        placeholder="Select Trip Type"
        rules={{ required: 'Trip type is required' }}
      />

      {/* Trip Purpose */}
      <TextField
        name="tripPurpose"
        label="Trip Purpose"
        placeholder="Describe the purpose of this trip"
      />
    </>
  );
}
