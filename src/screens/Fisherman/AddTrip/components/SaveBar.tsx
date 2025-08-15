// src/screens/Fisherman/AddTrip/components/SaveBar.tsx
import React, { useMemo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useFormContext, useWatch } from 'react-hook-form';
import { s } from '../styles';
import type { FormValues } from '../types';

type Props = {
  disabledReason?: string;
  gpsAvailable: boolean;
  onSave: () => void;
};

export default function SaveBar({ gpsAvailable, onSave }: Props) {
  const { control } = useFormContext<FormValues>();
  const numCrew = useWatch({ control, name: 'numCrew' });
  const numLifejackets = useWatch({ control, name: 'numLifejackets' });
  const tripCost = useWatch({ control, name: 'tripCost' });

  const numbersValid = useMemo(() => {
    const crewValid = Number(numCrew) > 0;
    const lifeValid = Number(numLifejackets) >= 0;
    const costValid = Number(tripCost) >= 0;
    return crewValid && lifeValid && costValid;
  }, [numCrew, numLifejackets, tripCost]);

  const disabled = !gpsAvailable || !numbersValid;

  return (
    <TouchableOpacity style={[s.button, disabled && s.buttonDisabled]} onPress={onSave} disabled={disabled}>
      <Text style={s.buttonText}>Save Trip</Text>
    </TouchableOpacity>
  );
}
