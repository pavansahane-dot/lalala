import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
  LayoutDashboard, Server, Users, Shield, Settings,
  Bell, FileText, Wifi, LogOut, Globe, ChevronDown, User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';
import AdminDashboardHome from '../components/admin/AdminDashboardHome';
import AdminServers from '../components/admin/AdminServers';
import AdminUsers from '../components/admin/AdminUsers';
import AdminWireGuard from '../components/admin/AdminWireGuard';
import AdminOpenVPN from '../components/admin/AdminOpenVPN';
import AdminSettings from '../components/admin/AdminSettings';
import AdminAlerts from '../components/admin/AdminAlerts';
import AdminAudit from '../components/admin/AdminAudit';

let socket: Socket | null = null;

export interface LiveStats {
  servers: { id: string; city: string; cpuUsage: number; ramUsage: number; bytesIn: bigint; bytesOut: bigint; isActive: boolean }[];
  activePeers: number;
  timestamp: number;
}

const NAV = [
  { to: '/admin', label: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/servers', label: 'servers', icon: Server },
  { to: '/admin/users', label: 'users', icon: Users },
  { to: '/admin/wireguard', label: 'wireguard', icon: Wifi },
  { to: '/admin/openvpn', label: 'openvpn', icon: Shield },
  { to: '/admin/alerts', label: 'alerts', icon: Bell },
  { to: '/admin/audit', label: 'auditLog', icon: FileText },
  { to: '/admin/settings', label: 'settings', icon: Settings },
];

const AdminPanel = () => {
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { selectedLanguage, setSelectedLanguage, languages, t } = useLanguage();

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchStats();

    socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('stats:update', (data: LiveStats) => setLiveStats(data));

    return () => { socket?.disconnect(); };
  }, [fetchStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f2f3f3] text-[#16191f]">
      {/* AWS-Style Admin Sidebar */}
      <aside className="w-[220px] bg-[#232f3e] flex flex-col border-r border-white/10 shrink-0">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="text-[#ff9900] w-5 h-5" />
            <span className="font-black text-white tracking-tight text-sm">
              ZeroTrace<span className="text-[#ff9900]">VPN</span>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1 block">
            {t.adminConsole}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#ff9900] text-black font-bold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{(t as any)[label]}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section - Logout Only */}
        <div className="px-2 pb-2 border-t border-white/10 pt-3">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen bg-[#f2f3f3]">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-4 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="appearance-none bg-gray-50 border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-colors cursor-pointer"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              <div className="text-right">
                <div className="text-sm font-bold text-[#16191f]">{user?.email?.split('@')[0] || 'Admin'}</div>
                <div className="text-xs text-gray-500">{user?.role || 'Administrator'}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#ff9900] flex items-center justify-center text-black font-black text-sm">
                {user?.email?.[0]?.toUpperCase() ?? 'A'}
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-xl z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#ff9900] flex items-center justify-center text-black font-black">
                        {user?.email?.[0]?.toUpperCase() ?? 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#16191f] truncate">{user?.email}</div>
                        <div className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/admin/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{t.settings}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/dashboard');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>{t.dashboard}</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
            <Routes>
              <Route index element={<AdminDashboardHome stats={stats} liveStats={liveStats} connected={connected} onRefresh={fetchStats} />} />
              <Route path="servers" element={<AdminServers liveStats={liveStats} />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="wireguard" element={<AdminWireGuard />} />
              <Route path="openvpn" element={<AdminOpenVPN />} />
              <Route path="alerts" element={<AdminAlerts />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="settings" element={<AdminSettings />} />
            </Routes>
        </div>

        {/* Footer */}
        <footer className="bg-[#232f3e] border-t border-white/10 px-6 py-4 shrink-0">
          <p className="text-white/40 text-xs text-center">
            © 2026 ZeroTraceVPN. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AdminPanel;
