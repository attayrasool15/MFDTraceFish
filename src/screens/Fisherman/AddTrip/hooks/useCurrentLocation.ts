// // src/screens/Fisherman/AddTrip/hooks/useCurrentLocation.ts
// import { useCallback, useEffect, useState } from 'react';
// import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
// import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
// import { Platform, Alert } from 'react-native';

// async function ensureLocationPermission(): Promise<boolean> {
//   const perm = Platform.select({
//     ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
//     android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
//   });
//   if (!perm) return false;
//   let status = await check(perm);
//   if (status === RESULTS.DENIED || status === RESULTS.LIMITED) {
//     status = await request(perm);
//   }
//   return status === RESULTS.GRANTED;
// }

// function getCurrentPosition(): Promise<GeoPosition> {
//   return new Promise((resolve, reject) => {
//     Geolocation.getCurrentPosition(resolve, reject, {
//       enableHighAccuracy: true, timeout: 12000, maximumAge: 0,
//       forceRequestLocation: true, showLocationDialog: true,
//     });
//   });
// }

// export function useCurrentLocation() {
//   const [gps, setGps] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
//   const [loading, setLoading] = useState(false);

//   const capture = useCallback(async () => {
//     setLoading(true);
//     try {
//       const ok = await ensureLocationPermission();
//       if (!ok) return;
//       const pos = await getCurrentPosition();
//       setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
//     } catch (e: any) {
//       Alert.alert('Location error', 'Could not get GPS location. You can try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { capture(); }, [capture]);

//   return { gps, loading, recapture: capture };
// }

/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState, useCallback, useRef } from 'react';
import Geolocation from '@react-native-community/geolocation'; // or your current provider
import NetInfo from '@react-native-community/netinfo';
import { readLastFix, saveLastFix, type LastFix } from '../../../../offline/locationCache';

type Gps = { lat: number; lng: number };
type Meta = {
  source: 'gps' | 'cache' | 'none';
  lastFixAt?: number | null;
  accuracy?: number | null;
  online?: boolean;
  error?: string | null;
};

export function useCurrentLocation() {
  const [gps, setGps] = useState<Gps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<Meta>({ source: 'none', lastFixAt: null, accuracy: null, online: true, error: null });
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const capture = useCallback(async () => {
    setLoading(true);
    setMeta(m => ({ ...m, error: null }));
    try {
      const net = await NetInfo.fetch();
      if (isMounted.current) setMeta(m => ({ ...m, online: !!net.isConnected }));

      await new Promise<void>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          pos => {
            const { latitude, longitude, accuracy } = pos.coords;
            const fix: LastFix = { lat: latitude, lng: longitude, ts: Date.now(), accuracy, source: 'gps' };
            if (isMounted.current) {
              setGps({ lat: latitude, lng: longitude });
              setMeta(m => ({ ...m, source: 'gps', lastFixAt: fix.ts, accuracy }));
            }
            saveLastFix(fix);
            resolve();
          },
          async (err) => {
            // fallback to cache
            const cached = await readLastFix();
            if (cached) {
              if (isMounted.current) {
                setGps({ lat: cached.lat, lng: cached.lng });
                setMeta(m => ({ ...m, source: 'cache', lastFixAt: cached.ts, accuracy: cached.accuracy ?? null, error: err?.message ?? null }));
              }
              resolve();
            } else {
              if (isMounted.current) {
                setGps(null);
                setMeta(m => ({ ...m, source: 'none', lastFixAt: null, accuracy: null, error: err?.message ?? 'No location fix' }));
              }
              resolve();
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
        );
      });
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { capture(); }, [capture]);

  const recapture = useCallback(() => { capture(); }, [capture]);

  return { gps, loading, recapture, meta };
}
