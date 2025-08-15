// src/screens/Fisherman/AddTrip/hooks/useCurrentLocation.ts
import { useCallback, useEffect, useState } from 'react';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Platform, Alert } from 'react-native';

async function ensureLocationPermission(): Promise<boolean> {
  const perm = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });
  if (!perm) return false;
  let status = await check(perm);
  if (status === RESULTS.DENIED || status === RESULTS.LIMITED) {
    status = await request(perm);
  }
  return status === RESULTS.GRANTED;
}

function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true, timeout: 12000, maximumAge: 0,
      forceRequestLocation: true, showLocationDialog: true,
    });
  });
}

export function useCurrentLocation() {
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await ensureLocationPermission();
      if (!ok) return;
      const pos = await getCurrentPosition();
      setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
    } catch (e: any) {
      Alert.alert('Location error', 'Could not get GPS location. You can try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { capture(); }, [capture]);

  return { gps, loading, recapture: capture };
}
