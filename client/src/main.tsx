import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

// Remove data from the old demo version: the demo login stored passwords in
// plain text, and favorites are now saved in the database (per account).
// Safe to delete this later.
try {
  window.localStorage.removeItem('techstore-demo-users');
  window.localStorage.removeItem('techstore-demo-session');
  window.localStorage.removeItem('techstore-favorites');
} catch {
  // localStorage can be blocked (e.g. private mode); nothing to clean then.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
