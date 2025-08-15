// src/screens/Fisherman/AddTrip/components/sections/ContactSpeciesCostSection.tsx
import React from 'react';
import TextField from '../fields/TextField';

export default function ContactSpeciesCostSection() {
  return (
    <>
      <TextField name="emergencyContact" label="Emergency Contact" placeholder="Contact Number" keyboardType="phone-pad" rules={{ required: 'Emergency contact is required' }} />
      <TextField name="targetSpecies" label="Target Species" placeholder="e.g., Tuna, Mackerel" rules={{ required: 'Target species is required' }} />
      <TextField name="tripCost" label="Cost for Trip" placeholder="0.00" keyboardType="decimal-pad" rules={{ required: 'Cost is required' }} />
    </>
  );
}
