// app/StoreProvider.tsx

'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';
import { ThemeProvider } from '@/components/providers/ThemeProvider'; // <-- add

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>{children}</ThemeProvider>   {/* <-- wrap */}
      </PersistGate>
    </Provider>
  );
}