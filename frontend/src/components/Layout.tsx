import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield, Server, Download, Activity, CreditCard, LogOut, ShieldCheck, Globe, ChevronDown, UserCircle, Settings, FileText, X, Mail, Lock, Save, CheckCircle, Loader2, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Footer from './Footer';
import api from '../api/axios';

const Layout = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, selectedLanguage, setSelectedLanguage, languages } = useLanguage();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const [emailOpen, setEmailOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (emailOpen && !profile) {
      api.get('/auth/profile').then(r => { setProfile(r.data); setName(r.data.name || ''); }).catch(() => {});
    }
  }, [emailOpen]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault(); setNameMsg(''); setNameSaving(true);
    try {
      const r = await api.put('/auth/profile', { name });
      setProfile((p: any) => ({ ...p, name: r.data.name }));
      setNameMsg('Name updated successfully.');
    } catch (err: any) { setNameMsg(err.response?.data?.error || 'Failed to update name.'); }
    finally { setNameSaving(false); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwMsg(''); setPwError('');
    if (newPassword !== confirmPassword) return setPwError('Passwords do not match.');
    if (newPassword.length < 8) return setPwError('Password must be at least 8 characters.');
    setPwSaving(true);
    try {
      await api.put('/auth/profile', { currentPassword, newPassword });
      setPwMsg('Password changed successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) { setPwError(err.response?.data?.error || 'Failed to change password.'); }
    finally { setPwSaving(false); }
  };

  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/dashboard',  label: t.dashboard,      icon: Activity },
    { to: '/servers',    label: t.servers,         icon: Server },
    { to: '/my-configs', label: 'My Configs',      icon: FileText },
    { to: '/configs',    label: t.configurations,  icon: Download },
    { to: '/billing',    label: t.subscription,    icon: CreditCard },
    { to: '/settings',   label: 'Settings',        icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#f2f3f3] text-[#16191f]">

      {/* ── AWS-style Navy Sidebar ── */}
      <aside className="w-64 bg-[#232f3e] flex flex-col shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <Shield className="text-[#ff9900] w-6 h-6 shrink-0" />
          <span className="text-white font-black tracking-tight text-lg leading-none">
            ZeroTrace<span className="text-[#ff9900]">VPN</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#ff9900] text-black font-bold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Administration</span>
              </div>
              <Link to="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#ff9900] text-black font-bold'
                    : 'text-[#ff9900]/80 hover:bg-white/10 hover:text-[#ff9900]'
                }`}>
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {t.adminPanel}
              </Link>
            </>
          )}
        </nav>

        {/* Language switcher */}
        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1">
            <Globe className="w-3 h-3" /> Language
          </div>
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as any)}
              className="w-full appearance-none bg-white/10 border border-white/20 text-white text-xs rounded px-3 py-2 pr-7 focus:outline-none focus:border-[#ff9900] transition-colors cursor-pointer">
              {languages.map(l => (
                <option key={l.code} value={l.code} className="bg-[#232f3e]">{l.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
          </div>
        </div>


      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-[#232f3e] border-b border-white/10 px-6 py-2.5 flex items-center justify-end shrink-0">
          <div className="relative">
            <button onClick={() => setEmailOpen(o => !o)}
              className="w-7 h-7 rounded-full bg-[#ff9900] flex items-center justify-center text-black text-xs font-black cursor-pointer">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </button>
          </div>
        </header>

        {/* ── Profile slide-in panel ── */}
        {emailOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setEmailOpen(false)} />
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
              {/* Panel header */}
              <div className="bg-[#232f3e] px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ff9900] flex items-center justify-center text-black font-black text-sm">
                    {user?.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <div className="text-white text-sm font-bold">{profile?.name || 'User'}</div>
                    <div className="text-white/50 text-xs truncate max-w-[160px]">{user?.email}</div>
                  </div>
                </div>
                <button onClick={() => setEmailOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 px-5 py-5 space-y-6">
                {/* Account info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-3.5 h-3.5 text-[#ff9900]" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-700 truncate">{profile?.email}</span>
                      {profile?.emailVerified && <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="px-2 py-0.5 bg-[#fff8ec] border border-[#ff9900]/30 rounded text-[10px] font-bold text-[#cc7a00] uppercase">{profile?.plan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500 text-xs">Since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Update name */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-3.5 h-3.5 text-[#ff9900]" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Display Name</span>
                  </div>
                  <form onSubmit={saveName} className="space-y-2">
                    {nameMsg && <div className={`px-3 py-2 rounded text-xs border ${nameMsg.includes('success') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{nameMsg}</div>}
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      className="w-full border border-gray-300 text-[#16191f] text-sm px-3 py-2 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                      placeholder="Your display name" />
                    <button type="submit" disabled={nameSaving}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-xs rounded transition-all disabled:opacity-60">
                      {nameSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                    </button>
                  </form>
                </div>

                {/* Change password */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-3.5 h-3.5 text-[#ff9900]" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Change Password</span>
                  </div>
                  <form onSubmit={savePassword} className="space-y-2">
                    {pwMsg && <div className="px-3 py-2 rounded text-xs border bg-green-50 border-green-200 text-green-700">{pwMsg}</div>}
                    {pwError && <div className="px-3 py-2 rounded text-xs border bg-red-50 border-red-200 text-red-700">{pwError}</div>}
                    {[
                      { ph: 'Current password', val: currentPassword, set: setCurrentPassword },
                      { ph: 'New password', val: newPassword, set: setNewPassword },
                      { ph: 'Confirm new password', val: confirmPassword, set: setConfirmPassword },
                    ].map(({ ph, val, set }) => (
                      <input key={ph} type="password" required value={val} onChange={e => set(e.target.value)}
                        className="w-full border border-gray-300 text-[#16191f] text-sm px-3 py-2 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                        placeholder={ph} />
                    ))}
                    <button type="submit" disabled={pwSaving}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#16191f] hover:bg-[#2d3748] text-white font-bold text-xs rounded transition-all disabled:opacity-60">
                      {pwSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />} Change Password
                    </button>
                  </form>
                </div>
              </div>

              {/* Logout */}
              <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded text-sm text-red-500 hover:bg-red-50 transition-all font-medium">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        <main className="flex-1 flex flex-col bg-[#f2f3f3]">
          <div className="flex-1 p-6">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
