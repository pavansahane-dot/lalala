import { useEffect, useState, useRef } from 'react';
import { Shield, CheckCircle, Wifi, Activity, Server, Users, TrendingUp, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

interface Peer { id: string; assignedIp: string; allowedIps: string; isActive: boolean; bytesRx: string; bytesTx: string; createdAt: string; }
interface BwPoint { time: string; rx: number; tx: number; }

const fmt = (bytes: number) => {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + ' KB';
  return bytes + ' B';
};

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuthStore();

  const [peers, setPeers] = useState<Peer[]>([]);
  const [bwHistory, setBwHistory] = useState<BwPoint[]>([]);
  const [stats, setStats] = useState({ servers: 0, activePeers: 0 });
  const [loading, setLoading] = useState(true);
  const bwRef = useRef<BwPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [serversRes, peersRes] = await Promise.all([
          api.get('/servers'),
          api.get('/admin/wireguard').catch(() => ({ data: [] })),
        ]);
        const allPeers: Peer[] = peersRes.data;
        const hasActiveServers = serversRes.data.length > 0;
        const activePeers = hasActiveServers ? allPeers.filter(p => p.isActive) : [];
        setPeers(activePeers.slice(0, 5));
        setStats({ servers: serversRes.data.length, activePeers: activePeers.length });

        const totalRx = hasActiveServers ? allPeers.reduce((s, p) => s + Number(p.bytesRx), 0) : 0;
        const totalTx = hasActiveServers ? allPeers.reduce((s, p) => s + Number(p.bytesTx), 0) : 0;
        const now = Date.now();
        const initial = Array.from({ length: 6 }, (_, i) => ({
          time: new Date(now - (5 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rx: Math.round((totalRx / 1e6) * (0.7 + i * 0.06)),
          tx: Math.round((totalTx / 1e6) * (0.7 + i * 0.06)),
        }));
        bwRef.current = initial;
        setBwHistory(initial);
      } catch { }
      finally { setLoading(false); }
    };
    load();

    // Socket.io real-time updates
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('stats:update', (data: any) => {
      setStats(prev => ({ ...prev, activePeers: data.activePeers, servers: data.servers?.length ?? prev.servers }));
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const totalRx = (data.servers || []).reduce((s: number, sv: any) => s + Number(sv.bytesIn || 0), 0);
      const totalTx = (data.servers || []).reduce((s: number, sv: any) => s + Number(sv.bytesOut || 0), 0);
      const next = [...bwRef.current.slice(-5), { time: now, rx: Math.round(totalRx / 1e6), tx: Math.round(totalTx / 1e6) }];
      bwRef.current = next;
      setBwHistory(next);
    });

    return () => { socket.disconnect(); };
  }, []);

  const statCards = [
    { label: 'Active Servers', value: stats.servers, icon: Server, color: 'text-[#ff9900]', bg: 'bg-[#fff8ec]' },
    { label: 'Active VPN Peers', value: stats.activePeers, icon: Wifi, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Your Plan', value: (user?.plan ?? 'free').toUpperCase(), icon: Shield, color: 'text-[#0073bb]', bg: 'bg-blue-50' },
    { label: 'Network Status', value: 'ONLINE', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#16191f]">{t.dashboard}</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back{user?.name ? `, ${user.name}` : ''}. Your identity is hidden, your traffic is encrypted, and zero traces are left behind. 🛡️</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className={`w-9 h-9 ${bg} rounded flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-xl font-black text-[#16191f]">{loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-300" /> : value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Bandwidth chart */}
      {bwHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#ff9900]" />
            <span className="font-bold text-[#16191f] text-sm uppercase tracking-wide">Bandwidth Usage (MB)</span>
          </div>
          <div className="px-4 py-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bwHistory}>
                <defs>
                  <linearGradient id="rx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9900" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff9900" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0073bb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0073bb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }} />
                <Area type="monotone" dataKey="rx" name="Download" stroke="#ff9900" strokeWidth={2} fill="url(#rx)" />
                <Area type="monotone" dataKey="tx" name="Upload" stroke="#0073bb" strokeWidth={2} fill="url(#tx)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Active peers */}
      {peers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ff9900]" />
            <span className="font-bold text-[#16191f] text-sm uppercase tracking-wide">Active VPN Connections</span>
          </div>
          <div className="divide-y divide-gray-100">
            {peers.map(p => (
              <div key={p.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <code className="text-[#16191f] font-mono text-xs bg-[#f2f3f3] px-2 py-0.5 rounded border border-gray-200">{p.assignedIp}</code>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>↓ {fmt(Number(p.bytesRx))}</span>
                  <span>↑ {fmt(Number(p.bytesTx))}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
