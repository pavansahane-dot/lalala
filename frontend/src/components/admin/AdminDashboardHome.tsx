import { useEffect, useState, useRef } from 'react';
import { RefreshCw, Users, Server, Wifi, CreditCard } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import type { LiveStats } from '../../pages/Admin';

interface Props {
  stats: any;
  liveStats: LiveStats | null;
  connected: boolean;
  onRefresh: () => void;
}

interface BandwidthPoint {
  time: string;
  bytesIn: number;
  bytesOut: number;
}

const fmt = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} KB`;
  return `${n} B`;
};

const AdminDashboardHome = ({ stats, liveStats, connected, onRefresh }: Props) => {
  const [bandwidthHistory, setBandwidthHistory] = useState<BandwidthPoint[]>([]);
  const prevBytes = useRef<{ bytesIn: number; bytesOut: number } | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!liveStats) return;
    const totalIn = liveStats.servers.reduce((s, srv) => s + Number(srv.bytesIn), 0);
    const totalOut = liveStats.servers.reduce((s, srv) => s + Number(srv.bytesOut), 0);

    const deltaIn = prevBytes.current ? Math.max(0, totalIn - prevBytes.current.bytesIn) : 0;
    const deltaOut = prevBytes.current ? Math.max(0, totalOut - prevBytes.current.bytesOut) : 0;
    prevBytes.current = { bytesIn: totalIn, bytesOut: totalOut };

    const label = new Date(liveStats.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setBandwidthHistory(prev => [...prev.slice(-59), { time: label, bytesIn: deltaIn, bytesOut: deltaOut }]);
  }, [liveStats]);

  const statCards = [
    { icon: Users, label: t.totalUsers, value: stats.totalUsers ?? 0, color: '#3b82f6' },
    { icon: CreditCard, label: 'Active Subs', value: stats.activeSubs ?? 0, color: '#10b981' },
    { icon: Server, label: 'Active Nodes', value: stats.activeNodes ?? 0, color: '#a855f7' },
    { icon: Wifi, label: 'Live Peers', value: liveStats?.activePeers ?? 0, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#16191f]">{t.dashboard}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t.realTimeOverview}</p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-[#16191f] transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards - 4 Equal Width Cards */}
      <div className="grid grid-cols-4 gap-6">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2.5 rounded-lg"
                style={{
                  backgroundColor: `${color}15`,
                  border: `1px solid ${color}30`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                {label}
              </p>
              <p className="text-3xl font-black text-[#16191f]">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live Bandwidth Chart - Fixed Height 260px */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Chart Header with Live Status */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Server className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-[#16191f] font-bold text-sm">Live Bandwidth</h2>
                <p className="text-gray-500 text-xs">Delta bytes per 5s tick</p>
              </div>
              {/* Live Status Badge */}
              <div
                className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                  connected
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                {connected ? `Live · ${liveStats?.activePeers ?? 0} peers` : t.offline}
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Inbound
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                Outbound
              </span>
            </div>
          </div>
        </div>

        {/* Chart Container - Fixed 260px Height */}
        <div className="px-6 py-4" style={{ height: '260px' }}>
          {bandwidthHistory.length < 2 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              {t.loading}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bandwidthHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={fmt}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: '#6b7280' }}
                  formatter={(v: any) => fmt(Number(v))}
                  cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="bytesIn"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#gIn)"
                  dot={false}
                  name="Inbound"
                />
                <Area
                  type="monotone"
                  dataKey="bytesOut"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gOut)"
                  dot={false}
                  name="Outbound"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Server Status Grid */}
      {liveStats && liveStats.servers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-[#16191f] font-bold text-sm mb-4">Server Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {liveStats.servers.map((srv) => (
              <div key={srv.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#16191f] font-semibold text-sm">{srv.city}</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${
                      srv.isActive
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        srv.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}
                    />
                    {srv.isActive ? t.online : t.offline}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>CPU</span>
                      <span>{srv.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(srv.cpuUsage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>RAM</span>
                      <span>{srv.ramUsage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${Math.min(srv.ramUsage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardHome;
