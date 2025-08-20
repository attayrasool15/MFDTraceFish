/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { fetchFishLots, type FishLot, type LotsPage } from '../../../services/lots';
import type { FishermanStackParamList } from '../../../app/navigation/stacks/FishermanStack';

type Nav = NativeStackNavigationProp<FishermanStackParamList>;

const PER_PAGE = 15;
const PRIMARY = '#1f720d';
const BORDER = '#E5E7EB';
const TEXT_MUTED = '#6B7280';

export default function AllLotsScreen() {
  const navigation = useNavigation<Nav>();

  const [items, setItems] = useState<FishLot[]>([]);
  const [meta, setMeta] = useState<LotsPage['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = meta?.total ?? items.length;

  const loadPage = useCallback(
    async (p: number, replace = false) => {
      setError(null);
      if (replace) setRefreshing(true);
      else setLoading(true);

      try {
        const { items: newItems, meta: newMeta } = await fetchFishLots({
          page: p,
          per_page: PER_PAGE,
        });

        setMeta(newMeta);
        setPage(newMeta.current_page);

        setItems(prev => {
          if (replace) return newItems;
          // append unique by id
          const map = new Map<number, FishLot>();
          prev.forEach(i => map.set(i.id, i));
          newItems.forEach(i => map.set(i.id, i));
          return Array.from(map.values());
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load lots.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);

  const onRefresh = useCallback(() => {
    loadPage(1, true);
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (loading || refreshing) return;
    if (!meta) return;
    if (meta.current_page >= meta.last_page) return;
    loadPage(meta.current_page + 1);
  }, [loading, refreshing, meta, loadPage]);

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
          }}
          accessibilityLabel="Go back"
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>All Lots</Text>

        <View style={{ width: 22 }} />

        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Total</Text>
            <Text style={styles.chipValue}>{total}</Text>
          </View>
        </View>
      </View>
    ),
    [navigation, total]
  );

  const renderItem = ({ item }: { item: FishLot }) => {
    const weight =
      typeof item.weight_kg === 'string'
        ? parseFloat(item.weight_kg || '0')
        : Number(item.weight_kg || 0);

    const captured =
      item.captured_at ? formatDateTime(item.captured_at) : '—';

    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title} numberOfLines={1}>
            {item.lot_no}
          </Text>
          <StatusPill status={item.status} />
        </View>

        <View style={{ height: 6 }} />

        <Text style={styles.muted} numberOfLines={1}>
          {item.species || '—'} • {weight.toFixed(2)} kg • Grade {item.grade || '—'}
        </Text>

        <View style={{ height: 6 }} />

        <Text style={styles.muted} numberOfLines={1}>
          Trip: {item.trip?.trip_id || `#${item.trip_id}`} • Port: {item.port_location || item.trip?.port_location || '—'}
        </Text>

        <Text style={styles.muted} numberOfLines={1}>
          Captured: {captured}
        </Text>
      </View>
    );
  };

  const keyExtractor = (it: FishLot) => String(it.id);

  const listFooter = useMemo(() => {
    if (!loading || refreshing) return null;
    return (
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }, [loading, refreshing]);

  return (
    <SafeAreaView style={styles.page}>
      {header}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={{ color: '#B91C1C', fontWeight: '600' }}>
            {error}
          </Text>
          <TouchableOpacity onPress={() => loadPage(1, true)} style={styles.retryBtn}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 12, paddingBottom: 28 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={0.2}
        onEndReached={onEndReached}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: TEXT_MUTED }}>No lots found.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/* ---------- Helpers & UI bits ---------- */
function formatDateTime(iso: string) {
  // ISO -> "YYYY-MM-DD HH:mm"
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function StatusPill({ status }: { status?: string | null }) {
  const label = (status || '').toLowerCase();
  const bg =
    label === 'verified' ? '#DCFCE7' :
    label === 'pending'  ? '#FEF9C3' :
    '#E5E7EB';
  const color =
    label === 'verified' ? '#166534' :
    label === 'pending'  ? '#92400E' :
    '#374151';
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label || 'unknown'}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 6,
  },
  chipsRow: {
    position: 'absolute',
    right: 12,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipLabel: { color: '#E5E7EB', fontSize: 11 },
  chipValue: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  errorBox: {
    borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2',
    margin: 12, borderRadius: 10, padding: 12,
  },
  retryBtn: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  card: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 12, backgroundColor: '#FFF',
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800', color: '#111827', maxWidth: '75%' },
  muted: { color: TEXT_MUTED, fontSize: 13 },
  pill: {
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
});
