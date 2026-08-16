// app/StoreProvider.tsx

'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { makeStore, persistor } from '@/lib/store';

// ✅ Store instance at module level (only created once)
let storeInstance: ReturnType<typeof makeStore> | null = null;

function getStore() {
  if (!storeInstance) {
    storeInstance = makeStore();
  }
  return storeInstance;
}

export default function StoreProvider({ 
  children,
}: {
  children: React.ReactNode;
}) {
  const store = getStore();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}