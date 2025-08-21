/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PALETTE = {
  okBg: '#E8F5E9', okFg: '#1B5E20',
  warnBg: '#FFF4E5', warnFg: '#EF6C00',
  errBg: '#FFEBEE', errFg: '#C62828',
  chipBg: '#F1F5F9', text: '#111827', sub: '#4B5563',
  border: '#E5E7EB',
};

function timeAgo(ts?: number | null) {
  if (!ts) return '';
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

export type Props = {
  isEdit: boolean;
  gps: { lat: number; lng: number } | null;
  loading: boolean;
  onRecapture: () => void;
  meta?: { source?: 'gps'|'cache'|'none'; lastFixAt?: number|null; online?: boolean; error?: string|null };
};

export default function GpsChip({ isEdit, gps, loading, onRecapture, meta }: Props) {
  const source = meta?.source ?? 'none';
  const online = meta?.online ?? true;

  // decide tone + icon + label
  let bg = PALETTE.chipBg, fg = PALETTE.text, icon = 'gps-not-fixed', label = 'Pending';
  if (loading) {
    bg = PALETTE.chipBg; fg = PALETTE.sub; icon = 'gps-not-fixed'; label = 'Locating…';
  } else if (gps && source === 'gps') {
    bg = PALETTE.okBg; fg = PALETTE.okFg; icon = 'gps-fixed'; label = isEdit ? 'Captured' : 'Enabled';
  } else if (gps && source === 'cache') {
    bg = PALETTE.warnBg; fg = PALETTE.warnFg; icon = 'history'; label = 'Last known';
  } else if (!gps) {
    bg = isEdit ? PALETTE.chipBg : PALETTE.errBg;
    fg = isEdit ? PALETTE.sub : PALETTE.errFg;
    icon = online ? 'gps-off' : 'wifi-off';
    label = isEdit ? 'Optional' : (online ? 'No fix' : 'Offline');
  }

  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: PALETTE.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {loading ? <ActivityIndicator size="small" color={fg} /> : <Icon name={icon} size={18} color={fg} />}
        <Text style={[styles.label, { color: fg }]}>{` GPS • ${label}`}</Text>
      </View>

      <View style={{ flex: 1 }}>
        {gps ? (
          <Text style={styles.coords} numberOfLines={1}>
            {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
            {source === 'cache' && meta?.lastFixAt ? `  •  ${timeAgo(meta.lastFixAt)}` : ''}
          </Text>
        ) : (
          <Text style={[styles.coords, { color: PALETTE.sub }]} numberOfLines={1}>
            {meta?.error ? meta.error : (isEdit ? 'Location optional on edit' : 'No coordinates yet')}
          </Text>
        )}
      </View>

      <Pressable
        onPress={onRecapture}
        style={({ pressed }) => [
          styles.btn,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        accessibilityLabel="Recapture location"
      >
        <Icon name="my-location" size={16} color="#fff" />
        <Text style={styles.btnText}>Recapture</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 10,
  },
  label: { fontWeight: '800', marginLeft: 6 },
  coords: { color: '#111827', fontWeight: '600' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1B5E20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  btnText: { color: '#fff', fontWeight: '800' },
});
