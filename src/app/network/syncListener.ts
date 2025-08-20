import NetInfo from '@react-native-community/netinfo';
import { store } from '../../redux/store';
import { syncPendingTrips } from '../../redux/actions/tripSyncActions';

let unsub: null | (() => void) = null;

export function startSyncListener() {
  if (unsub) return;
  unsub = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      // @ts-ignore
      store.dispatch(syncPendingTrips());
    }
  });
}

export function stopSyncListener() {
  if (unsub) { unsub(); unsub = null; }
}
