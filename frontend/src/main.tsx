import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './context/LanguageContext'

// Clear stale auth storage from old schema versions
try {
  const raw = localStorage.getItem('auth-storage');
  if (raw) {
    const parsed = JSON.parse(raw);
    // If old version had token or isAuthenticated at root state level, wipe it
    if (parsed?.state?.token !== undefined || parsed?.state?.isAuthenticated !== undefined) {
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }
} catch { localStorage.removeItem('auth-storage'); }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
