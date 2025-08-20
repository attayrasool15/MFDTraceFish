// src/screens/Fisherman/AddTrip/components/sections/CrewSafetySection.tsx
import React from 'react';
import TextField from '../fields/TextField';

export default function CrewSafetySection() {
  return (
    <>
      <TextField name="numCrew" label="Number of Crew" placeholder="0" keyboardType="numeric" rules={{ required: 'Number of crew is required' }} />
      {/* <TextField name="numLifejackets" label="Number of Lifejackets" placeholder="0" keyboardType="numeric" /> */}
    </>
  );
}
