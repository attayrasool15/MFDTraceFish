// App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/app/navigation/RootNavigator';
import AuthBootstrap from './src/provider/AuthBootstrap';
import TripSyncProvider from './src/provider/TripSyncProvider';

     // ⬅️ Optional

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AuthBootstrap>
          <TripSyncProvider>
            <RootNavigator />
          </TripSyncProvider>
        </AuthBootstrap>
      </Provider>
    </GestureHandlerRootView>
  );
}
