import React, { useEffect } from 'react';
import { initTripSync } from '../offline/tripSync';

export default function TripSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // sets up: initial sync + NetInfo listener (auto-sync when online)
    const cleanup = initTripSync();
    return cleanup;
  }, []);

  return <>{children}</>;
}
