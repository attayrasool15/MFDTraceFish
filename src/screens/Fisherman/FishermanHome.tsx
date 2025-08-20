/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/actions/authActions';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FishermanStackParamList } from '../../app/navigation/stacks/FishermanStack';
import type { RootState } from '../../redux/store';
import {
  getTripCounts,
  listTrips,
  type TripStatus,
} from '../../services/trips';

type Nav = NativeStackNavigationProp<FishermanStackParamList, 'FishermanHome'>;

const PALETTE = {
  green700: '#1B5E20',
  green600: '#2E7D32',
  green50: '#E8F5E9',
  text900: '#111827',
  text500: '#6B7280',
  border: '#E5E7EB',
  surface: '#FFFFFF',
};

const ActionCard = ({
  label,
  iconSource,
  onPress,
}: {
  label: string;
  iconSource: any;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionCard,
      pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
    ]}
    android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Image source={iconSource} style={styles.actionIcon} />
    <Text style={styles.actionLabel}>{label}</Text>
  </Pressable>
);

const FishermanHome = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<Nav>();
  const user = useSelector((s: RootState) => (s as any).auth?.user);
  const name = user?.name || 'Fisherman';
  const role = user?.role || user?.user_type || 'fisherman';
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompact = width < 360; // small phones
  const isTablet = width >= 768; // big screens

  const localTrips = useSelector(
    (s: RootState) => (s as any).trips?.items ?? [],
  );

  const [counts, setCounts] = useState<{ [K in TripStatus]?: number }>({});
  const [statusHints, setStatusHints] = useState<{
    [K in TripStatus]?: string;
  }>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [errorCounts, setErrorCounts] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Logout',
        style: 'destructive',
        onPress: () => dispatch<any>(logout()),
      },
    ]);
  }, [dispatch]);

  useLayoutEffect(() => {
    navigation.setOptions?.({
      title: 'Fisherman',
      headerStyle: { backgroundColor: PALETTE.green700 },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { color: '#FFFFFF', fontWeight: '800' },
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.headerLogoutBtn}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Text style={styles.headerLogoutText}>⎋ Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleLogout]);

  const fetchCounts = useCallback(async () => {
    setLoadingCounts(true);
    // Local-only counts (no API)
    const localCountFor = (st: TripStatus) =>
      (localTrips || []).filter(
        (t: any) => String(t.status || 'pending').toLowerCase() === st,
      ).length;

    setCounts({
      pending: localCountFor('pending'),
      approved: localCountFor('approved'),
      active: localCountFor('active'),
      completed: localCountFor('completed'),
      cancelled: 0,
      all: (localTrips || []).length,
    } as any);

    setStatusHints({
      pending: 'offline',
      approved: 'offline',
      active: 'offline',
      completed: 'offline',
    } as any);

    setLoadingCounts(false);
  }, [localTrips]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const roleLabel = useMemo(() => String(role).replace('_', ' '), [role]);

  const goToOfflinePending = () => {
    // @ts-ignore ensure 'OfflineTrips' exists in FishermanStack
    navigation.navigate('OfflineTrips');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.surface }}>
      {/* Green status bar to match header */}
      <StatusBar backgroundColor={PALETTE.green700} barStyle="light-content" />

      <View style={styles.screen}>
        {/* Welcome / Profile strip */}
        <View
          style={[styles.headerCard, isCompact && styles.headerCardCompact]}
        >
          <View
            style={[styles.headerLeft, isCompact && styles.headerLeftCompact]}
          >
            <Image
              source={require('../../assets/images/placeholderIMG.png')}
              style={[
                styles.avatar,
                isCompact && styles.avatarSm,
                isTablet && styles.avatarLg,
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.eyebrow, isCompact && { fontSize: 11 }]}>
                Welcome
              </Text>
              <Text
                style={[
                  styles.title,
                  isCompact && styles.titleSm,
                  isTablet && styles.titleLg,
                ]}
              >
                {name}
              </Text>
              <View
                style={[styles.rolePill, isCompact && styles.rolePillTight]}
              >
                <Text style={[styles.roleText, isCompact && { fontSize: 11 }]}>
                  {roleLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Right actions: Refresh + Logout */}
          <View
            style={[styles.headerRight, isCompact && styles.headerRightStack]}
          >
            <Pressable
              onPress={fetchCounts}
              style={({ pressed }) => [
                styles.refreshBtn,
                isCompact && styles.headerBtnSm,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Refresh dashboard"
            >
              <Text style={[styles.refreshText, isCompact && { fontSize: 12 }]}>
                ↻ Refresh
              </Text>
            </Pressable>
          </View>
        </View>
        
        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {/* One full-width button per row, scrollable */}
          <ScrollView
            style={[
              styles.actionsScroll,
              { maxHeight: Math.min(screenHeight * 0.5, 420) }, // ⬅️ dynamic cap
            ]}
            contentContainerStyle={styles.actionsList}
            showsVerticalScrollIndicator
          >
            <ActionCard
              label="All Trips"
              iconSource={require('../../assets/images/fishIcon.png')}
              onPress={() => navigation.navigate('AllTrip')}
            />
            <ActionCard
              label="Pending offline Trips"
              iconSource={require('../../assets/images/fishIcon.png')}
              onPress={goToOfflinePending}
            />
            <ActionCard
              label="+ New Trips"
              iconSource={require('../../assets/images/boatIcon.png')}
              onPress={() => navigation.navigate('Trip')}
            />
            <ActionCard
              label="+ Create Lots"
              iconSource={require('../../assets/images/fishIcon.png')}
              onPress={() => navigation.navigate('Lots')}
            />
            <ActionCard
              label="All Lots"
              iconSource={require('../../assets/images/fishIcon.png')}
              onPress={() => navigation.navigate('LotsList')}
            />
            {/* Add more actions—list will scroll */}
          </ScrollView>
          <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutBtn,
                isCompact && styles.headerBtnSm,
                pressed && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Logout"
            >
              <Text style={[styles.logoutText, isCompact && { fontSize: 12 }]}>
                ⎋ Logout
              </Text>
            </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 38,
    paddingBottom: 12,
    backgroundColor: PALETTE.surface,
  },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flexBasis: '48%',
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  statLabel: { fontSize: 12, color: PALETTE.text500 },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  statHint: { marginTop: 4, fontSize: 11, color: '#9CA3AF' },
  errorText: { marginTop: 8, color: '#C62828' },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 12 },

  // Header logout button
  headerLogoutBtn: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  headerLogoutText: { color: '#FFFFFF', fontWeight: '800' },
  section: { marginTop: 26, borderRadius: 20 },
  sectionTitle: {
    fontSize: 18,

    fontWeight: '800',
    color: PALETTE.green700,
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 10,
  },

  /** NEW: scroll container for actions */
  actionsScroll: {
    // no fixed height here; height is set dynamically inline via maxHeight
  },

  /** vertical stack for actions */
  actionsList: {
    gap: 12, // spacing between rows
  },

  /** full-width action card */
  actionCard: {
    alignSelf: 'stretch',
    backgroundColor: PALETTE.surface,
    borderRadius: 16,
    paddingHorizontal: 22,
    marginHorizontal: 10,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  actionIcon: { width: 40, height: 40, marginBottom: 8, resizeMode: 'contain' },
  actionLabel: {
    fontSize: 16,
    color: PALETTE.green700,
    fontWeight: '800',
    textAlign: 'center',
  },

  headerCard: {
    backgroundColor: PALETTE.green700,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  /** compact: stack vertically */
  headerCardCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },

  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerLeftCompact: { alignItems: 'flex-start' },

  avatar: { height: 56, width: 56, borderRadius: 28 },
  avatarSm: { height: 44, width: 44, borderRadius: 22 },
  avatarLg: { height: 64, width: 64, borderRadius: 32 },

  eyebrow: {
    color: 'white',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: PALETTE.surface,
    fontWeight: '800',
    fontSize: 22,
    marginTop: 2,
  },
  titleSm: { fontSize: 18, marginTop: 0 },
  titleLg: { fontSize: 24 },

  rolePill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.green50,
  },
  rolePillTight: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3 },
  roleText: { color: PALETTE.green700, fontWeight: '700', fontSize: 12 },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  /** compact: push actions under profile, spread full width */
  headerRightStack: {
    marginTop: 6,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },

  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#F3F4F6',
  },
  refreshText: { color: PALETTE.green700, fontWeight: '700' },

  logoutBtn: {
    marginTop:15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEE2E2',
  },
  logoutText: { color: '#B91C1C', fontWeight: '800', textAlign:'center' },

  /** compact button padding */
  headerBtnSm: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});

export default FishermanHome;
