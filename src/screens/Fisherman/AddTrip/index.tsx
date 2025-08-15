/* eslint-disable react-native/no-inline-styles */
// src/screens/Fisherman/AddTrip/index.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { s } from './styles';
import { buildTripId } from '../../../utils/ids';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import BasicInfoSection from './components/sections/BasicInfoSection';
import DropdownsSection from './components/sections/DropdownsSection';
import CrewSafetySection from './components/sections/CrewSafetySection';
import ContactSpeciesCostSection from './components/sections/ContactSpeciesCostSection';
import LocationCard from './components/LocationCard';
import SaveBar from './components/SaveBar';

import type { FormValues } from './types';
import { useDispatch } from 'react-redux';
import { createTripLocal } from '../../../redux/actions/tripActions';
import type { FishermanStackParamList } from '../../../app/navigation/stacks/FishermanStack';
import SectionCard from './components/SectionCard';

type Nav = NativeStackNavigationProp<FishermanStackParamList, 'Trip'>;

export default function AddTripScreen() {
  const methods = useForm<FormValues>({
    defaultValues: {
      captainName: '',
      boatNameId: '',
      tripPurpose: '',
      port: '',
      seaType: '',
      numCrew: '',
      numLifejackets: '',
      emergencyContact: '',
      seaConditions: '',
      targetSpecies: '',
      tripCost: '',
    },
    mode: 'onTouched',
  });

  const [tripId] = useState(buildTripId());
  const { gps, loading, recapture } = useCurrentLocation();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();

  const onSave = methods.handleSubmit(values => {
    if (!gps) {
      Alert.alert(
        'Location required',
        'Please capture location before saving.',
      );
      return;
    }
    const tripDraft = {
      tripId,
      captainName: values.captainName.trim(),
      boatNameId: values.boatNameId.trim(),
      tripPurpose: values.tripPurpose.trim(),
      port: values.port,
      seaType: values.seaType,
      numCrew: Number(values.numCrew),
      numLifejackets: Number(values.numLifejackets),
      emergencyContact: values.emergencyContact.trim(),
      seaConditions: values.seaConditions,
      targetSpecies: values.targetSpecies.trim(),
      tripCost: Number(values.tripCost),
      gps,
      departureAt: new Date().toISOString(),
      arrivalAt: null,
      _dirty: true,
    };
    dispatch(createTripLocal(tripDraft));
    Alert.alert('Saved', `Trip ${tripId} saved offline.`, [
      {
        text: 'Add Lots',
        onPress: () => navigation.navigate('Lots', { tripId }),
      },
      { text: 'OK' },
    ]);
  });

  return (
<View style={[s.page, { flex: 1 }]}>
      {/* Hero/Header */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>Add Trip</Text>

        <View style={s.chipRow}>
          <View style={s.chip}>
            <Text style={s.chipLabel}>Trip ID</Text>
            <Text style={s.chipValue} numberOfLines={1}>
              {tripId}
            </Text>
          </View>

          <View style={[s.chip, gps ? s.chipOk : s.chipWarn]}>
            <Text style={s.chipLabel}>GPS</Text>
            <Text style={s.chipValue}>{gps ? 'Captured' : 'Pending'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={s.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormProvider {...methods}>
          <SectionCard title="Basic Info" subtitle="Captain & vessel details">
            <BasicInfoSection />
          </SectionCard>

          <SectionCard
            title="Route & Conditions"
            subtitle="Port and sea conditions"
          >
            <DropdownsSection />
          </SectionCard>

          <SectionCard
            title="Crew & Safety"
            subtitle="Crew size and lifejackets"
          >
            <CrewSafetySection />
          </SectionCard>

          <SectionCard
            title="Contacts & Targets"
            subtitle="Emergency contact and species"
          >
            <ContactSpeciesCostSection />
          </SectionCard>

          <SectionCard
            title="Starting Location"
            subtitle="Capture your current coordinates"
          >
            <LocationCard gps={gps} loading={loading} onRecapture={recapture} />
          </SectionCard>

          <SaveBar gpsAvailable={!!gps} onSave={onSave} />
        </FormProvider>
      </ScrollView>
    </View>
  );
}
