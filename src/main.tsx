// IMPORTANT: Import Sentry BEFORE any other imports
// This ensures Sentry is initialized before React application starts
import './sentry';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { UnifiedAuthProvider } from './context/UnifiedAuthContext';
import App from './App.tsx';
import './index.css';
import { initSecurity } from './utils/securityUtils';

// Initialize security measures
initSecurity();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <UnifiedAuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UnifiedAuthProvider>
    </SessionProvider>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}
