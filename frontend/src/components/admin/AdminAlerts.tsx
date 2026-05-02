import { useEffect, useState, useRef } from 'react';
import { Loader2, Plus, ToggleLeft, ToggleRight, Bell, BellRing, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '../../api/axios';

const TYPES = ['server_down', 'cert_expiry', 'bandwidth_exceeded'];

interface FiredAlert {
  ruleId: string;
  type: string;
  target: string;
  threshold?: number;
  firedAt: string;
}

const typeColor = (t: string) =>
  t === 'server_down' ? 'bg-red-100 text-red-700 border-red-200' :
  t === 'cert_expiry' ? 'bg-amber-100 text-amber-700 border-amber-200' :
  'bg-blue-100 text-blue-700 border-blue-200';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'server_down', target: '', threshold: '' });
  const [liveAlerts, setLiveAlerts] = useState<FiredAlert[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/alerts'); setAlerts(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();

    // Subscribe to live alert:fired events
    socketRef.current = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current.on('alert:fired', (data: FiredAlert) => {
      setLiveAlerts(prev => [data, ...prev].slice(0, 20));
      // Refresh rules to update lastFiredAt
      load();
    });

    return () => { socketRef.current?.disconnect(); };
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/alerts', {
        ...form,
        threshold: form.threshold ? Number(form.threshold) : undefined
      });
      setShowAdd(false);
      setForm({ type: 'server_down', target: '', threshold: '' });
      load();
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const toggle = async (id: string, isEnabled: boolean) => {
    await api.patch(`/admin/alerts/${id}`, { isEnabled: !isEnabled });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#16191f]">Alerts & Notifications</h1>
          <p className="text-gray-500 text-sm mt-0.5">Server downtime, cert expiry & bandwidth rules</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      {/* Live fired alerts feed */}
      {liveAlerts.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 shadow-sm p-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <BellRing className="w-4 h-4 animate-bounce" /> Live Fired Alerts
            </div>
            <button onClick={() => setLiveAlerts([])} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {liveAlerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${typeColor(a.type)}`}>
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold uppercase">{a.type.replace(/_/g, ' ')}</span>
              <span className="text-gray-500 font-mono truncate">→ {a.target}</span>
              <span className="ml-auto shrink-0 text-gray-500">{new Date(a.firedAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add rule form */}
      {showAdd && (
        <form onSubmit={add} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">Target ID</label>
            <input value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} required
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30"
              placeholder="serverId / userId / certId" />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">Threshold (days / MB)</label>
            <input type="number" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))}
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30"
              placeholder="30" />
          </div>
          <div className="col-span-full flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-[#16191f] transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm">Create Rule</button>
          </div>
        </form>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className={`bg-white rounded-lg border p-4 flex items-center gap-4 transition-all shadow-sm ${a.isEnabled ? 'border-gray-200' : 'border-gray-300 opacity-50'}`}>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${typeColor(a.type)}`}>
              {a.type.replace(/_/g, ' ')}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[#16191f] text-sm font-medium">
                Target: <code className="text-gray-500 font-mono text-xs">{a.target}</code>
              </div>
              {a.threshold != null && (
                <div className="text-gray-500 text-xs mt-0.5">Threshold: {a.threshold} {a.type === 'cert_expiry' ? 'days' : 'MB'}</div>
              )}
            </div>
            {a.lastFiredAt && (
              <div className="text-gray-500 text-xs shrink-0 text-right">
                <div>Last fired</div>
                <div className="text-gray-600">{new Date(a.lastFiredAt).toLocaleString()}</div>
              </div>
            )}
            <button onClick={() => toggle(a.id, a.isEnabled)}
              className="shrink-0 transition-colors hover:opacity-80">
              {a.isEnabled
                ? <ToggleRight className="w-6 h-6 text-green-600" />
                : <ToggleLeft className="w-6 h-6 text-gray-400" />}
            </button>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="py-16 text-center text-gray-400">No alert rules configured. Create one above.</div>
        )}
      </div>
    </div>
  );
};

export default AdminAlerts;
