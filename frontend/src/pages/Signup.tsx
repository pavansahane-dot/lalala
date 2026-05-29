import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Loader2, ArrowRight, CheckCircle, XCircle, Phone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

type Tab = 'email' | 'phone';

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || '/api'}/oauth/google`;

const passwordRules = [
  { label: 'At least 8 characters',  test: (p: string) => p.length >= 8 },
  { label: 'Contains a number',       test: (p: string) => /\d/.test(p) },
  { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
];

const Signup = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const [tab, setTab]           = useState<Tab>('email');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allRulesPassed = passwordRules.every(r => r.test(password));
  const passwordsMatch = password === confirm && confirm.length > 0;

  // ── Email register ──────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!allRulesPassed) return setError('Password does not meet the requirements.');
    if (!passwordsMatch)  return setError('Passwords do not match.');
    setIsLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      navigate('/login?registered=1');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  // ── Phone — send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      await api.post('/oauth/phone/send-otp', { phone });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally { setIsLoading(false); }
  };

  // ── Phone — verify OTP (creates account if new) ─────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const { data } = await api.post('/oauth/phone/verify-otp', { phone, otp });
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally { setIsLoading(false); }
  };

  const switchTab = (next: Tab) => { setTab(next); setError(''); setOtpSent(false); setOtp(''); };

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex flex-col">

      <header className="bg-[#232f3e] border-b border-white/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ff9900]" />
            <span className="text-white font-black tracking-tight text-sm">
              ZeroTrace<span className="text-[#ff9900]">VPN</span>
            </span>
          </div>
          <Link to="/login" className="text-white/60 hover:text-white text-xs font-medium transition-colors">
            {t.signin} →
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Card header */}
          <div className="bg-[#232f3e] rounded-t px-8 py-5 text-center">
            <div className="w-12 h-12 bg-[#ff9900]/10 border border-[#ff9900]/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-[#ff9900]" />
            </div>
            <h1 className="text-white font-bold text-lg">{t.createAccount}</h1>
            <p className="text-white/50 text-xs mt-1">ZeroTraceVPN Console</p>
          </div>

          {/* Card body */}
          <div className="bg-white border border-gray-200 border-t-0 rounded-b shadow-md px-8 py-6">

            {error && (
              <div className="mb-4 px-3 py-2.5 rounded text-xs font-medium border bg-red-50 border-red-200 text-red-700">{error}</div>
            )}

            {/* Google button */}
            <a href={GOOGLE_AUTH_URL}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all mb-4">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email / Phone tabs */}
            <div className="flex rounded border border-gray-200 mb-4 overflow-hidden">
              <button onClick={() => switchTab('email')}
                className={`flex-1 py-2 text-xs font-bold transition-colors ${tab === 'email' ? 'bg-[#232f3e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Mail className="w-3.5 h-3.5 inline mr-1.5" />Email
              </button>
              <button onClick={() => switchTab('phone')}
                className={`flex-1 py-2 text-xs font-bold transition-colors ${tab === 'phone' ? 'bg-[#232f3e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Phone className="w-3.5 h-3.5 inline mr-1.5" />Phone
              </button>
            </div>

            {/* ── Email form ── */}
            {tab === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{t.name}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                      placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                      placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                      placeholder="••••••••" />
                  </div>
                  {password.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {passwordRules.map(rule => {
                        const passed = rule.test(password);
                        return (
                          <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                            {passed ? <CheckCircle className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                      className={`w-full border text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:ring-1 transition-all ${
                        confirm.length > 0
                          ? passwordsMatch
                            ? 'border-green-400 focus:border-green-500 focus:ring-green-200'
                            : 'border-red-300 focus:border-red-400 focus:ring-red-200'
                          : 'border-gray-300 focus:border-[#ff9900] focus:ring-[#ff9900]/30'
                      }`}
                      placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-sm rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.createAccount}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* ── Phone form — enter number ── */}
            {tab === 'phone' && !otpSent && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                      placeholder="+91 98765 43210" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Include country code e.g. +91, +1</p>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-sm rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* ── Phone form — enter OTP ── */}
            {tab === 'phone' && otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-gray-500 text-center">OTP sent to <span className="font-bold text-[#16191f]">{phone}</span></p>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Enter OTP</label>
                  <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} autoFocus
                    className="w-full border border-gray-300 text-[#16191f] py-3 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all text-center text-2xl font-mono tracking-[0.5em]"
                    placeholder="000000" />
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-sm rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Create Account'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
                  ← Change number
                </button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                {t.alreadyHaveAccount}
                <Link to="/login" className="ml-1.5 text-[#0073bb] hover:text-[#005a8e] font-semibold transition-colors">{t.signin}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
