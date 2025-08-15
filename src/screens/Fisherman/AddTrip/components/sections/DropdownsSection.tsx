// src/screens/Fisherman/AddTrip/components/sections/DropdownsSection.tsx
import React from 'react';
import DropdownField from '../fields/DropdownField';
import { PORTS, SEA_CONDITIONS, SEA_TYPES } from '../../constants';

export default function DropdownsSection() {
  return (
    <>
      <DropdownField name="port" label="Port" options={PORTS} />
      <DropdownField name="seaType" label="Type of Sea Going" options={SEA_TYPES} />
      <DropdownField name="seaConditions" label="Sea Conditions" options={SEA_CONDITIONS} />
    </>
  );
}
