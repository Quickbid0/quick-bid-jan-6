// IMPORTANT: Import Sentry BEFORE any other imports
// This ensures Sentry is initialized before React application starts
import './sentry';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UnifiedAuthProvider } from './context/UnifiedAuthContext';
import App from './App.tsx';
import './index.css';
import { initSecurity } from './utils/securityUtils';

// Initialize security measures
initSecurity();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnifiedAuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
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
