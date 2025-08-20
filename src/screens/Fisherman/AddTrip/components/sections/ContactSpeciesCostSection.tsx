// src/screens/Fisherman/AddTrip/components/sections/ContactSpeciesCostSection.tsx
import React from 'react';
import TextField from '../fields/TextField';

export default function ContactSpeciesCostSection() {
  return (
    <>
      <TextField
        name="emergencyContact"
        label="Emergency Contact"
        placeholder="Contact Number"
        keyboardType="phone-pad"
      />
      <TextField
        name="targetSpecies"
        label="Target Species"
        placeholder="e.g., Tuna, Mackerel"
        rules={{ required: 'Target species is required' }} // <-- required
      />

       <TextField
        name="crewCount"
        label="Total crew members (at least 1)"
        placeholder="e.g., 1"
        keyboardType="numeric"
        rules={{
          required: 'Crew count is required',
          validate: (v: any) => Number(v) >= 1 || 'Crew count must be at least 1',
        }}
      />
      <TextField
        name="fuelCost"
        label="Fuel Cost (Rs)"
        placeholder="0.00"
        keyboardType="decimal-pad"
      />
      <TextField
        name="estimatedCatch"
        label="Estimated Catch weight(kg)"
        placeholder="0"
        keyboardType="numeric"
      />
      <TextField
        name="equipmentCost"
        label="Operational Cost (Rs)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        rules={{ required: 'Target species is required' }}
      />
    </>
  );
}
