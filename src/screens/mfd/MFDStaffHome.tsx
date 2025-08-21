/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/actions/authActions';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MFDStaffStackParamList } from '../../app/navigation/stacks/MFDStaffStack';
import { getTripCounts, type TripCounts } from '../../services/trips';

type Nav = NativeStackNavigationProp<MFDStaffStackParamList, 'MFDStaffHome'>;

const PALETTE = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text900: '#111827',
  text700: '#374151',
  text600: '#4B5563',
  green50: '#E8F5E9',
  green700: '#1B5E20',
  warn: '#EF6C00',
  error: '#C62828',
  info: '#1E88E5',
  purple: '#6A1B9A',
  chip: '#F1F5F9',
};

const APPBAR_BG = '#1f720d';

export default function MFDStaffHome() {
  const dispatch = useDispatch();
  const navigation = useNavigation<Nav>();

  const [online, setOnline] = useState<boolean>(true);
  const [counts, setCounts] = useState<TripCounts | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errText, setErrText] = useState<string | null>(null);

  // Connectivity banner
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => setOnline(!!state.isConnected));
    NetInfo.fetch().then(s => setOnline(!!s.isConnected)).catch(() => {});
    return () => { unsub && unsub(); };
  }, []);

  const loadCounts = useCallback(async () => {
    setLoading(true);
    setErrText(null);
    try {
      const { totals } = await getTripCounts();
      setCounts(totals);
    } catch (e: any) {
      setErrText(e?.message || 'Failed to load trip counts');
      setCounts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCounts();
    } finally {
      setRefreshing(false);
    }
  }, [loadCounts]);

  const confirmLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  }, [dispatch]);

  const goAllTrips = useCallback(() => {
    navigation.navigate('AllTrips');
  }, [navigation]);

  const goReports = useCallback(() => {
    // Replace with your actual screen name if different
    navigation.navigate('Reports' as any);
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <StatusBar backgroundColor={APPBAR_BG} barStyle="light-content" />

      {/* App Bar */}
      <View style={styles.appbar}>
        <View style={styles.appbarSide} />
        <Text style={styles.appbarTitle}>MFD Dashboard</Text>
        <Pressable
          onPress={confirmLogout}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Icon name="logout" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Online/Offline Banner */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor: online ? PALETTE.green50 : '#FFF7ED',
            borderColor: online ? '#C8E6C9' : '#FED7AA',
          },
        ]}
      >
        <Icon
          name={online ? 'wifi' : 'wifi-off'}
          size={18}
          color={online ? PALETTE.green700 : PALETTE.warn}
        />
        <Text
          style={{
            marginLeft: 8,
            color: online ? PALETTE.green700 : PALETTE.warn,
            flex: 1,
          }}
        >
          {online ? 'Online — live data enabled' : 'Offline — showing cached/limited data'}
        </Text>
        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => [styles.refreshChip, pressed && { opacity: 0.85 }]}
        >
          <Icon name="refresh" size={16} color={PALETTE.text700} />
          <Text style={{ color: PALETTE.text700, marginLeft: 6 }}>Refresh</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome / Header Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatar}>
              <Icon name="anchor" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Welcome back, MFD!</Text>
              <Text style={styles.subtle}>
                You’re logged into the Marine Fisheries Department Portal.
              </Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            <Chip icon="verified-user" label="Secure" tone="ok" />
            <Chip icon="speed" label="Fast access" tone="info" />
            <Chip icon="integration-instructions" label="API connected" tone={online ? 'ok' : 'warn'} />
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Profile</Text>

          <Row icon="person" label="Full Name" value="MFD Staff" />
          <Row icon="mail" label="Email Address" value="mfd.staff@gmail.com" />
          <Row icon="phone" label="Phone Number" value="03095237230" />

          <View style={[styles.row, { marginTop: 8 }]}>
            <Icon name="verified" size={18} color={PALETTE.green700} style={{ marginRight: 10 }} />
            <Text style={styles.rowLabel}>Account Status</Text>
            <View style={{ flex: 1 }} />
            <StatusPill text="Active" tone="ok" />
          </View>

          <View style={styles.divider} />

          <Row icon="badge" label="Employee ID" value="ID-1515" />
          <Row icon="apartment" label="Department/Position" value="Not specified" />
        </View>

        {/* Trip Overview */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trip Overview</Text>
            <Pressable onPress={goAllTrips} style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.85 }]}>
              <Icon name="list" size={18} color={PALETTE.info} />
              <Text style={{ color: PALETTE.info, marginLeft: 6, fontWeight: '600' }}>View all</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={PALETTE.green700} />
              <Text style={{ color: PALETTE.text600, marginTop: 8 }}>Loading stats…</Text>
            </View>
          ) : errText ? (
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ color: PALETTE.warn }}>{errText}</Text>
            </View>
          ) : (
            <View style={styles.statGrid}>
              <StatCard icon="inbox" label="All" value={counts?.all ?? 0} onPress={goAllTrips} />
              <StatCard icon="hourglass-empty" label="Pending" value={counts?.pending ?? 0} onPress={goAllTrips} tone="warn" />
              <StatCard icon="check-circle" label="Approved" value={counts?.approved ?? 0} onPress={goAllTrips} tone="ok" />
              <StatCard icon="navigation" label="Active" value={counts?.active ?? 0} onPress={goAllTrips} tone="info" />
              <StatCard icon="flag" label="Completed" value={counts?.completed ?? 0} onPress={goAllTrips} />
              <StatCard icon="cancel" label="Cancelled" value={counts?.cancelled ?? 0} onPress={goAllTrips} tone="error" />
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionGrid}>
            <ActionTile
              icon="list-alt"
              title="All Trips"
              subtitle="Browse & review"
              onPress={goAllTrips}
            />
            <ActionTile
              icon="assessment"
              title="View Reports"
              subtitle="Analytics & KPIs"
              onPress={goReports}
            />
          </View>
        </View>

        {/* Logout (secondary) */}
        <Pressable
          onPress={confirmLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}
        >
          <Icon name="logout" size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>Logout</Text>
        </Pressable>

        {/* Footer space */}
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

/* -------------------- tiny UI atoms -------------------- */
function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={18} color={PALETTE.text600} style={{ marginRight: 10 }} />
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function StatusPill({ text, tone = 'ok' }: { text: string; tone?: 'ok' | 'warn' | 'error' | 'info' }) {
  const colors = {
    ok: { bg: '#E8F5E9', fg: PALETTE.green700 },
    warn: { bg: '#FFF4E5', fg: PALETTE.warn },
    error: { bg: '#FFEBEE', fg: PALETTE.error },
    info: { bg: '#E3F2FD', fg: PALETTE.info },
  }[tone];
  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: colors.fg, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

function Chip({ icon, label, tone = 'default' }: { icon?: string; label: string; tone?: 'ok'|'warn'|'error'|'info'|'default' }) {
  const bg =
    tone === 'ok' ? '#E8F5E9' :
    tone === 'warn' ? '#FFF4E5' :
    tone === 'error' ? '#FFEBEE' :
    tone === 'info' ? '#E3F2FD' : PALETTE.chip;
  const color =
    tone === 'ok' ? PALETTE.green700 :
    tone === 'warn' ? PALETTE.warn :
    tone === 'error' ? PALETTE.error :
    tone === 'info' ? PALETTE.info : PALETTE.text700;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      {icon ? <Icon name={icon} size={14} color={color} style={{ marginRight: 6 }} /> : null}
      <Text style={{ color, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  onPress,
  tone = 'default',
}: {
  icon: string;
  label: string;
  value: number;
  onPress?: () => void;
  tone?: 'default' | 'ok' | 'warn' | 'error' | 'info';
}) {
  const toneBg = {
    default: PALETTE.surface,
    ok: '#F0FDF4',
    warn: '#FFF7ED',
    error: '#FEF2F2',
    info: '#EFF6FF',
  }[tone];
  const toneIcon = {
    default: PALETTE.text600,
    ok: PALETTE.green700,
    warn: PALETTE.warn,
    error: PALETTE.error,
    info: PALETTE.info,
  }[tone];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCard,
        { backgroundColor: toneBg, borderColor: PALETTE.border },
        pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
      ]}
    >
      <Icon name={icon} size={20} color={toneIcon} />
      <Text style={{ color: PALETTE.text700, marginTop: 6 }}>{label}</Text>
      <Text style={{ color: PALETTE.text900, fontWeight: '800', fontSize: 18, marginTop: 2 }}>
        {value}
      </Text>
    </Pressable>
  );
}

function ActionTile({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
    >
      <View style={styles.tileIcon}>
        <Icon name={icon} size={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: PALETTE.text900, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: PALETTE.text600, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={PALETTE.text600} />
    </Pressable>
  );
}

/* -------------------- styles -------------------- */
const styles = StyleSheet.create({
  appbar: {
    backgroundColor: APPBAR_BG,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    height: 56 + (Platform.OS === 'ios' ? 10 : 0),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  appbarSide: { width: 40, height: 40 },
  appbarTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  refreshChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  card: {
    backgroundColor: PALETTE.surface,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  h1: { color: PALETTE.text900, fontSize: 20, fontWeight: '800' },
  subtle: { color: PALETTE.text600, marginTop: 4 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { color: PALETTE.text900, fontSize: 16, fontWeight: '800', flex: 1 },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { color: PALETTE.text600 },
  rowValue: { color: PALETTE.text900, fontWeight: '700', maxWidth: '60%' },
  divider: { height: 1, backgroundColor: PALETTE.border, marginVertical: 10 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
  },
  statCard: {
    width: '30%',
    minWidth: 110,
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  actionGrid: { marginTop: 10 },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.surface,
    borderRadius: 12,
    marginBottom: 10,
  },
  tileIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: PALETTE.green700,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutBtn: {
    marginHorizontal: 14, marginTop: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PALETTE.error,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: PALETTE.green700,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
});
