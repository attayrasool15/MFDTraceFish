// src/utils/ids.ts
export function tsStamp(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}${m}${day}-${hh}${mm}${ss}`;
}

export function buildTripId(d = new Date()) {
  const stamp = tsStamp(d);
  const rand = Math.random().toString(36).slice(-4).toUpperCase();
  return `TRIP-${stamp}-${rand}`;
}

export function buildLotNo(d = new Date()) {
  const stamp = tsStamp(d);
  const rand = Math.random().toString(36).slice(-4).toUpperCase();
  return `LOT-${stamp}-${rand}`;
}
