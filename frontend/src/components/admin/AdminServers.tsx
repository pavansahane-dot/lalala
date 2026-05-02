import { useEffect, useState } from 'react';
import { Play, Square, RotateCcw, Plus, Loader2, Terminal, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import type { LiveStats } from '../../pages/Admin';

interface Props { liveStats: LiveStats | null; }

const AdminServers = ({ liveStats }: Props) => {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [output, setOutput] = useState<{ id: string; text: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ country: '', city: '', ip: '', protocol: 'wireguard', sshUser: 'ubuntu', sshPort: '22' });

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/servers'); setServers(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const control = async (id: string, action: string) => {
    setActionLoading(`${id}-${action}`);
    try {
      const r = await api.post(`/admin/servers/${id}/control`, { action });
      setOutput({ id, text: r.data.stdout || r.data.stderr || 'Done.' });
    } catch (e: any) {
      setOutput({ id, text: e.response?.data?.error || 'SSH error' });
    } finally {
      setActionLoading(null);
    }
  };

  const toggle = async (id: string, isActive: boolean) => {
    await api.patch(`/admin/servers/${id}`, { isActive: !isActive });
    load();
  };

  const addServer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/servers', { ...form, sshPort: Number(form.sshPort) });
      setShowAdd(false);
      setForm({ country: '', city: '', ip: '', protocol: 'wireguard', sshUser: 'ubuntu', sshPort: '22' });
      load();
    } catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
  };

  const deleteServer = async (id: string, city: string) => {
    if (!confirm(`Delete server "${city}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/servers/${id}`);
      load();
    } catch (e: any) { alert(e.response?.data?.error || 'Failed to delete'); }
  };

  const getLive = (id: string) => liveStats?.servers.find(s => s.id === id);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#16191f]">Server Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">SSH control & real-time health</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Add Server
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addServer} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
          {[['country', 'Country'], ['city', 'City'], ['ip', 'IP Address'], ['sshUser', 'SSH User'], ['sshPort', 'SSH Port']].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs text-gray-600 font-medium mb-1 block">{label}</label>
              <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">Protocol</label>
            <select value={form.protocol} onChange={e => setForm(p => ({ ...p, protocol: e.target.value }))}
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30">
              <option value="wireguard">WireGuard</option>
              <option value="openvpn">OpenVPN</option>
            </select>
          </div>
          <div className="col-span-full flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-[#16191f] transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm">Save Server</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {servers.map(s => {
          const live = getLive(s.id);
          return (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex flex-wrap items-center gap-4">
                {/* Status badge */}
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${s.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  {s.isActive ? 'Online' : 'Offline'}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#16191f]">{s.city}, {s.country}</div>
                  <code className="text-blue-600 text-xs font-mono">{s.ip}</code>
                  <span className="ml-2 text-xs text-gray-500 uppercase">{s.protocol}</span>
                </div>

                {/* Live stats */}
                {live && (
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>CPU <span className="text-[#16191f] font-bold">{live.cpuUsage.toFixed(1)}%</span></span>
                    <span>RAM <span className="text-[#16191f] font-bold">{live.ramUsage.toFixed(1)}%</span></span>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {[
                    { action: 'start', icon: <Play className="w-3.5 h-3.5" />, color: 'green' },
                    { action: 'stop', icon: <Square className="w-3.5 h-3.5" />, color: 'red' },
                    { action: 'restart', icon: <RotateCcw className="w-3.5 h-3.5" />, color: 'amber' },
                    { action: 'status', icon: <Terminal className="w-3.5 h-3.5" />, color: 'blue' },
                  ].map(({ action, icon, color }) => (
                    <button key={action} onClick={() => control(s.id, action)}
                      disabled={!!actionLoading}
                      title={action}
                      className={`p-2 rounded-lg border transition-all disabled:opacity-40 ${
                        color === 'green' ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' :
                        color === 'red' ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' :
                        color === 'amber' ? 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100' :
                        'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100'
                      }`}>
                      {actionLoading === `${s.id}-${action}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
                    </button>
                  ))}
                  <button onClick={() => toggle(s.id, s.isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${s.isActive ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'}`}>
                    {s.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => deleteServer(s.id, s.city)}
                    className="p-2 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all" title="Delete server">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SSH output */}
              {output?.id === s.id && (
                <pre className="mt-3 bg-gray-50 rounded-lg p-3 text-xs text-green-700 font-mono overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                  {output.text}
                </pre>
              )}
            </div>
          );
        })}
        {servers.length === 0 && (
          <div className="text-center py-16 text-gray-400">No servers found. Add one above.</div>
        )}
      </div>
    </div>
  );
};

export default AdminServers;
