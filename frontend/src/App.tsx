import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import CookieConsent from './components/CookieConsent';

import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Configs from './pages/Configs';
import MyConfigs from './pages/MyConfigs';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';

import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#232f3e', color: '#fff', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#ff9900', secondary: '#232f3e' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/"      element={<Landing />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/signup"   element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="/auth/callback"   element={<AuthCallback />} />
        <Route path="/privacy-policy"  element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/contact"         element={<Contact />} />

        {/* Protected user dashboard routes - with main Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/servers"    element={<Servers />} />
            <Route path="/my-configs" element={<MyConfigs />} />
            <Route path="/configs"    element={<Configs />} />
            <Route path="/billing"    element={<Billing />} />
            <Route path="/profile"    element={<Profile />} />
            <Route path="/settings"   element={<Settings />} />
          </Route>
          
          {/* Protected admin routes - standalone, NO Layout wrapper */}
          <Route path="/admin/*" element={<Admin />} />
        </Route>

        {/* Catch-all — redirect unknown URLs to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieConsent />
    </Router>
  );
}

export default App;
