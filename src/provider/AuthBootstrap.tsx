import React, { useEffect, useState } from 'react';
import { loadTokenFromStorage } from '../services/https';

export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try { await loadTokenFromStorage(); }
      finally { setReady(true); }
    })();
  }, []);

  // Render children immediately if you don't want a gate.
  // If you prefer blocking until token loads, gate on `ready`.
  return <>{children}</>;
}
