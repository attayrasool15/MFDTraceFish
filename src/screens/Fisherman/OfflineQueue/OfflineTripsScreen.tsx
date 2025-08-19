/* eslint-disable no-void */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import type { FishermanStackParamList } from '../../../app/navigation/stacks/FishermanStack';
import { syncPendingTrips } from '../../../redux/actions/tripSyncActions';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Nav = NativeStackNavigationProp<FishermanStackParamList, 'OfflineTrips'>;

const PALETTE = {
  green800: '#145A1F',
  green700: '#1B5E20',
  green600: '#2E7D32',
  green50: '#E8F5E9',
  text900: '#111827',
  text700: '#374151',
  text600: '#4B5563',
  text500: '#6B7280',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  warn: '#EF6C00',
  error: '#C62828',
  info: '#1E88E5',
};

type QueueItem = {
  id: string;
  status: 'queued' | 'uploading' | 'error' | 'uploaded';
  error?: string | null;
  draft: any;
  createdAt?: string;
};

type LocalTrip = {
  tripId: string;
  _dirty?: boolean;
  status?: string;
  createdAt?: string;
  [k: string]: any;
};

type Row = {
  tripId: string;
  status: 'queued' | 'uploading' | 'error';
  error?: string | null;
  title: string;
  subtitle: string;
  draft: any;
  createdAt?: string;
  rowKey: string; // UNIQUE, used by FlatList
  source: 'queue' | 'local';
};

// optional NetInfo
let NetInfo: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  NetInfo = require('@react-native-community/netinfo');
} catch {}

export default function OfflineTripsScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();

  const queue: QueueItem[] =
    (useSelector(
      (s: RootState) => (s as any).tripQueue?.queue,
    ) as QueueItem[]) || [];
  const localTrips: LocalTrip[] =
    (useSelector((s: RootState) => (s as any).trips?.items) as LocalTrip[]) ||
    [];

  const [syncing, setSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<
    'all' | 'queued' | 'uploading' | 'error'
  >('all');

  useLayoutEffect(() => {
    navigation.setOptions?.({
      title: 'Offline Trips',
      headerStyle: { backgroundColor: PALETTE.green700 },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { color: '#FFFFFF', fontWeight: '800' },
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => void handleSyncAll()}
          disabled={syncing}
          style={[styles.headerBtn, syncing && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Sync all"
        >
          <Text style={styles.headerBtnText}>
            {syncing ? 'Syncing…' : 'Sync All'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, syncing]);

  useEffect(() => {
    if (!NetInfo?.addEventListener) return;
    const unsub = NetInfo.addEventListener((state: any) => {
      const online = !!(state.isInternetReachable ?? state.isConnected);
      setIsOnline(online);
    });
    return () => unsub?.();
  }, []);

  // Helpers for dedupe
  const statusRank: Record<Row['status'], number> = {
    error: 3,
    uploading: 2,
    queued: 1,
  };
  const parseTs = (s?: string) => (s ? Date.parse(s) || 0 : 0);
  const betterOf = (a: Row | undefined, b: Row) => {
    if (!a) return b;
    const ra = statusRank[a.status];
    const rb = statusRank[b.status];
    if (rb > ra) return b;
    if (rb < ra) return a;
    // tie -> latest createdAt wins
    return parseTs(b.createdAt) > parseTs(a.createdAt) ? b : a;
  };

  // Build unique rows:
  const mergedList: Row[] = useMemo(() => {
    const map = new Map<string, Row>(); // key: tripId

    // 1) queue items (dedupe per tripId)
    for (const q of Array.isArray(queue) ? queue : []) {
      if (q?.status === 'uploaded') continue;
      const d = q?.draft || {};
      const tid = String(d?.tripId || q?.id || '').trim();
      if (!tid) continue;

      const status: Row['status'] =
        q.status === 'error' ? 'error' : (q.status as any) || 'queued';

      const row: Row = {
        tripId: tid,
        status,
        error: q.error || null,
        title: `${d.boatNameId || 'Trip'} • ${tid}`,
        subtitle:
          [d.departure_port, d.destination_port].filter(Boolean).join(' → ') ||
          d.tripPurpose ||
          'Pending',
        draft: d,
        createdAt: q.createdAt,
        // UNIQUE key: include source + queue id + createdAt fallback
        rowKey: `queue:${q.id || tid}:${q.createdAt || ''}`,
        source: 'queue',
      };

      map.set(tid, betterOf(map.get(tid), row));
    }

    // 2) local _dirty items (only if not present from queue)
    for (const t of Array.isArray(localTrips) ? localTrips : []) {
      if (!t?._dirty) continue;
      const tid = String(t?.tripId || '').trim();
      if (!tid || map.has(tid)) continue;

      const status: Row['status'] =
        (String(t?.status || 'queued').toLowerCase() as any) || 'queued';

      const row: Row = {
        tripId: tid,
        status,
        error: null,
        title: `${t.boatNameId || 'Trip'} • ${tid}`,
        subtitle:
          [t.departure_port, t.destination_port].filter(Boolean).join(' → ') ||
          t.tripPurpose ||
          'Pending',
        draft: t,
        createdAt: t.createdAt,
        // UNIQUE key: include source + tid + createdAt fallback
        rowKey: `local:${tid}:${t.createdAt || ''}`,
        source: 'local',
      };

      map.set(tid, row);
    }

    const rows = Array.from(map.values());
    rows.sort((a, b) => parseTs(b.createdAt) - parseTs(a.createdAt));
    return rows;
  }, [queue, localTrips]);

  const offlineList = useMemo(() => {
    if (filter === 'all') return mergedList;
    return mergedList.filter(it => it.status === filter);
  }, [mergedList, filter]);

  const counters = useMemo(() => {
    const c = { all: mergedList.length, queued: 0, uploading: 0, error: 0 };
    for (const it of mergedList) {
      if (it.status === 'queued') c.queued++;
      else if (it.status === 'uploading') c.uploading++;
      else if (it.status === 'error') c.error++;
    }
    return c;
  }, [mergedList]);

  const handleSyncAll = useCallback(async () => {
    try {
      setSyncing(true);
      setLastError(null);
      // @ts-ignore
      await dispatch(syncPendingTrips());
      setLastSyncedAt(Date.now());
    } catch (e: any) {
      const msg = e?.message || 'Unable to sync now.';
      setLastError(msg);
      Alert.alert('Sync failed', msg);
    } finally {
      setSyncing(false);
    }
  }, [dispatch]);

  const handleRetryOne = useCallback(
    async (tripId?: string) => {
      // If you add syncTripById in future, call it here.
      await handleSyncAll();
    },
    [handleSyncAll],
  );

  const handleOpen = useCallback(
    (tripId: string) => {
      try {
        // @ts-ignore
        navigation.navigate('Trip', { tripId });
      } catch {
        Alert.alert(
          'Not wired',
          'Trip editor screen is not connected to navigation.',
        );
      }
    },
    [navigation],
  );

  const renderItem = ({ item }: { item: Row }) => {
    const badge = statusBadge(item.status, item.error);
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              {item.subtitle || '—'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.fg }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        {item.error ? (
          <Text style={styles.errorText}>⚠ {item.error}</Text>
        ) : null}

        <View style={styles.cardActions}>
          <Pressable
            onPress={() => handleRetryOne(item.tripId)}
            style={({ pressed }) => [
              styles.btn,
              styles.btnPrimary,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.btnPrimaryText}>Retry</Text>
          </Pressable>

          <Pressable
            onPress={() => handleOpen(item.tripId)}
            style={({ pressed }) => [
              styles.btn,
              styles.btnGhost,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.btnGhostText}>Open</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const lastSyncedLabel = useMemo(() => {
    if (!lastSyncedAt) return '—';
    const d = new Date(lastSyncedAt);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${d.toDateString()} ${hh}:${mm}`;
  }, [lastSyncedAt]);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('FishermanHome'); // fallback
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.surface }}>
      <StatusBar backgroundColor={PALETTE.green700} barStyle="light-content" />

      <View style={styles.screen}>
        {/* In-screen header bar */}
        <View style={styles.hero}>
          <View style={styles.heroLeftRow}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="arrow-back" size={22} color="#FFFFFF" />
            </Pressable>

            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Waiting to Sync</Text>
              <Text style={styles.heroSub}>
                {`Items: ${mergedList.length} • Last sync: ${lastSyncedLabel}`}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => void handleSyncAll()}
            disabled={syncing}
            style={({ pressed }) => [
              styles.syncBtn,
              syncing && { opacity: 0.7 },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sync all"
          >
            {syncing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.syncBtnText}>Sync All</Text>
            )}
          </Pressable>
        </View>

        {/* Online/Offline Banner */}
        {isOnline === false ? (
          <View style={styles.bannerOffline}>
            <Text style={styles.bannerOfflineText}>
              You’re offline. We’ll sync when you reconnect.
            </Text>
          </View>
        ) : null}

        {/* Error banner (dismissible) */}
        {lastError ? (
          <Pressable
            onPress={() => setLastError(null)}
            style={({ pressed }) => [
              styles.bannerError,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error"
          >
            <Text style={styles.bannerErrorText}>⚠ {lastError}</Text>
            <Text style={styles.bannerErrorHint}>Tap to dismiss</Text>
          </Pressable>
        ) : null}

        {/* Filter chips */}
        <View style={styles.chipsRow}>
          <Chip
            label={`All (${counters.all})`}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <Chip
            label={`Queued (${counters.queued})`}
            active={filter === 'queued'}
            onPress={() => setFilter('queued')}
          />
          <Chip
            label={`Uploading (${counters.uploading})`}
            active={filter === 'uploading'}
            onPress={() => setFilter('uploading')}
          />
          <Chip
            label={`Error (${counters.error})`}
            active={filter === 'error'}
            onPress={() => setFilter('error')}
          />
        </View>

        {/* List */}
        <FlatList<Row>
          data={offlineList}
          keyExtractor={it => it.rowKey} // ← UNIQUE!
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>All caught up 🎉</Text>
              <Text style={styles.emptySub}>
                No offline trips are waiting to sync.
              </Text>
              <Pressable
                onPress={() => void handleSyncAll()}
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnPrimary,
                  { marginTop: 12 },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.btnPrimaryText}>Check Again</Text>
              </Pressable>
            </View>
          }
          refreshing={syncing}
          onRefresh={() => void handleSyncAll()}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </SafeAreaView>
  );
}

/* ---------- Small UI bits ---------- */

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.9 },
      ]}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function statusBadge(
  status: 'queued' | 'uploading' | 'error',
  error?: string | null,
): { label: string; bg: string; fg: string } {
  if (status === 'uploading')
    return { label: 'Uploading…', bg: '#E3F2FD', fg: PALETTE.info };
  if (status === 'error' || error)
    return { label: 'Error', bg: '#FFEBEE', fg: PALETTE.error };
  return { label: 'Queued', bg: PALETTE.green50, fg: PALETTE.green600 };
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 38,
    backgroundColor: PALETTE.surface,
  },

  headerBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 4,
  },
  headerBtnText: { color: '#FFFFFF', fontWeight: '800' },

  hero: {
    backgroundColor: PALETTE.green700,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadow(0.08, 8, 3),
  },
  heroLeft: { flex: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  heroLeftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginRight: 4,
  },

  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PALETTE.green600,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  syncBtnText: { color: '#FFFFFF', fontWeight: '800' },

  bannerOffline: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  bannerOfflineText: { color: '#9A3412', fontWeight: '700' },

  bannerError: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bannerErrorText: { color: PALETTE.error, fontWeight: '800' },
  bannerErrorHint: { color: '#B91C1C', marginTop: 2, fontSize: 12 },

  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: PALETTE.green50,
    borderColor: PALETTE.green600,
  },
  chipText: { color: PALETTE.text700, fontWeight: '700' },
  chipTextActive: { color: PALETTE.green700 },

  card: {
    backgroundColor: PALETTE.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 12,
    ...shadow(0.05, 8, 3),
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: PALETTE.text900 },
  cardSub: { marginTop: 2, fontSize: 12, color: PALETTE.text600 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: '800' },

  errorText: { marginTop: 8, color: PALETTE.error },

  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnPrimary: {
    borderColor: PALETTE.green600,
    backgroundColor: PALETTE.green600,
  },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '800' },
  btnGhost: {
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
  },
  btnGhostText: { color: PALETTE.text900, fontWeight: '800' },

  empty: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: PALETTE.text900 },
  emptySub: { marginTop: 6, color: PALETTE.text600, textAlign: 'center' },
});

/* ---- platform shadow helper ---- */
function shadow(opacity: number, radius: number, height: number) {
  if (Platform.OS === 'android') {
    return { elevation: 2 };
  }
  return {
    shadowColor: '#000',
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height },
  };
}
