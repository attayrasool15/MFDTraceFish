/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { FishermanStackParamList } from '../../../app/navigation/stacks/FishermanStack';
import { createLot } from '../../../redux/actions/lotApiActions';
import { buildLotNo } from '../../../utils/ids';

import { s, theme } from './styles';
import { useCurrentLocation } from './useCurrentLocation';
import SectionCard from './components/SectionCard';
import { ReadonlyRow } from './components/ReadonlyRow';
import { TextField, NumberField } from './components/Fields';
import LocationCard from './components/LocationCard';
import PhotoCard from './components/PhotoCard';
import SaveBar from './components/SaveBar';
import FocusAwareStatusBar from './components/FocusAwareStatusBar';

type Nav = NativeStackNavigationProp<FishermanStackParamList, 'Lots'>;
type LotsRoute = RouteProp<FishermanStackParamList, 'Lots'>;

interface FormValues {
  species: string;
  weightKg: string;
  grade: string;
}

export default function AddLotScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<Nav>();
  const route = useRoute<LotsRoute>();
  const tripId = route.params?.tripId;

  const methods = useForm<FormValues>({
    defaultValues: { species: '', weightKg: '', grade: '' },
    mode: 'onTouched',
  });

  const [lotNo] = useState(buildLotNo());
  const { gps, loading: locLoading, recapture } = useCurrentLocation();
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const weightValue = methods.watch('weightKg');
  const weightValid = useMemo(() => {
    const n = Number(weightValue);
    return !isNaN(n) && n > 0;
  }, [weightValue]);

  const onSave = methods.handleSubmit(values => {
    if (!tripId) {
      Alert.alert('No Trip', 'Open Add Lots from a Trip after saving the trip.');
      return;
    }
    if (!gps) {
      Alert.alert('Location required', 'Please capture location before saving.');
      return;
    }

    const lotDraft = {
      lotNo,
      tripId,
      species: values.species.trim(),
      grade: values.grade.trim(),
      weightKg: Number(values.weightKg),
      capturedAt: new Date().toISOString(),
      gps,
      photoLocalPath: photoUri || undefined,
      _dirty: true,
    };

    dispatch<any>(createLot(lotDraft));
    Alert.alert('Saved', `Lot ${lotNo} saved.`, [{ text: 'OK' }]);
  });

  return (
    <>
      {/* iOS: paint the notch/top area to match header color */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.primary }}>
        <FocusAwareStatusBar barStyle="light-content" backgroundColor={theme.primary} />
      </SafeAreaView>

      {/* Main safe area (sides/bottom) */}
      <SafeAreaView style={s.page} edges={['left', 'right', 'bottom']}>
        {/* Hero Header */}
        <View style={s.hero}>
          <View style={s.topRow}>
            <MaterialIcons
              name="arrow-back"
              size={22}
              color="#fff"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
            />
            <Text style={s.heroTitle}>Add Lot</Text>
            <View style={{ width: 22 }} />{/* spacer for symmetry */}
          </View>

          <View style={s.chipRow}>
            <View style={s.chip}>
              <Text style={s.chipLabel}>Lot No</Text>
              <Text style={s.chipValue} numberOfLines={1}>{lotNo}</Text>
            </View>
          
            <View style={[s.chip, gps ? s.chipOk : s.chipWarn]}>
              <Text style={s.chipLabel}>GPS</Text>
              <Text style={s.chipValue}>{gps ? 'Captured' : 'Pending'}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={s.container}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <FormProvider {...methods}>
            <SectionCard title="Details" subtitle="Species, weight & grade">
              <TextField name="species" label="Species" placeholder="e.g., Pomfret" rules={{ required: 'Species is required' }} />
              <NumberField name="weightKg" label="Weight (kg)" placeholder="0.0" rules={{ required: 'Weight is required' }} />
              {!weightValid && weightValue?.length > 0 && (
                <Text style={s.errorText}>Enter a number greater than 0</Text>
              )}
              <TextField name="grade" label="Grade" placeholder="A / B / C" rules={{ required: 'Grade is required' }} />
            </SectionCard>

            <SectionCard title="Location" subtitle="Capture your current coordinates">
              <LocationCard gps={gps} loading={locLoading} onRecapture={recapture} />
            </SectionCard>

            <SectionCard title="Photo (optional)" subtitle="Attach a picture of the lot">
              <PhotoCard photoUri={photoUri} onChange={setPhotoUri} />
            </SectionCard>

            <ReadonlyRow label="Review" value={`Lot ${lotNo} will be linked to Trip ${tripId ?? '—'}`} />

            <SaveBar label="Save Lot" disabled={!gps || !weightValid } onPress={onSave} />
          </FormProvider>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
