// IMPORTANT: Import Sentry BEFORE any other imports
// This ensures Sentry is initialized before React application starts
import './sentry';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UnifiedAuthProvider } from './context/UnifiedAuthContext';
import { ConfirmDialogProvider } from './hooks/useConfirmDialog';
import App from './App.tsx';
import './index.css';
import { initSecurity } from './utils/securityUtils';
import { setupAxiosInterceptors } from './utils/axiosInterceptor';

// Initialize security measures
initSecurity();

// Setup axios interceptor for 401 token refresh handling (FIX S-02, S-04)
setupAxiosInterceptors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnifiedAuthProvider>
      <ConfirmDialogProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfirmDialogProvider>
    </UnifiedAuthProvider>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}

