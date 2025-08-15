// src/screens/Fisherman/AddTrip/components/sections/BasicInfoSection.tsx
import React from 'react';
import TextField from '../fields/TextField';

export default function BasicInfoSection() {
  return (
    <>
      <TextField name="captainName" label="Captain Name" placeholder="Captain Name" rules={{ required: 'Captain name is required' }} />
      <TextField name="boatNameId" label="Boat Name & ID" placeholder="Boat Name / ID" rules={{ required: 'Boat name & ID are required' }} />
      <TextField name="tripPurpose" label="Trip Purpose" placeholder="Fishing / Survey / Transport" rules={{ required: 'Trip purpose is required' }} />
    </>
  );
}
