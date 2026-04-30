
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';

import { initializeFirebaseServices } from '@/services/firebaseInitService';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const AppWithFirebase = () => {
  useEffect(() => {
    initializeFirebaseServices();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithFirebase />
  </React.StrictMode>
);
