import React, { useEffect, useState } from 'react';
import { Loader2, UserX, Save, BarChart2 } from 'lucide-react';
import api from '../../api/axios';

const ROLES = ['user', 'support', 'admin', 'super_admin'];

interface BwInfo { usedMb: number; limitMb: number; pct: number; unlimited: boolean; }

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, any>>({});
  const [bwMap, setBwMap] = useState<Record<string, BwInfo>>({});
  const [expandedBw, setExpandedBw] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/users'); setUsers(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}`, editing[id]);
      setEditing(p => { const n = { ...p }; delete n[id]; return n; });
      load();
    } catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
  };

  const disconnect = async (id: string) => {
    if (!confirm('Force-disconnect this user? Their active session will be revoked.')) return;
    try { await api.post(`/admin/users/${id}/disconnect`); alert('Session revoked.'); }
    catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
  };

  const loadBandwidth = async (id: string) => {
    if (expandedBw === id) { setExpandedBw(null); return; }
    try {
      const r = await api.get(`/admin/users/${id}/bandwidth`);
      setBwMap(p => ({ ...p, [id]: r.data }));
      setExpandedBw(id);
    } catch { setExpandedBw(id); }
  };

  const set = (id: string, key: string, val: any) =>
    setEditing(p => ({ ...p, [id]: { ...p[id], [key]: val } }));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#16191f]">User Management</h1>
        <p className="text-gray-500 text-sm mt-0.5">Roles, bandwidth quotas & session control</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-[10px] uppercase tracking-widest">
              <tr>
                {['Email', 'Role', 'Admin Role', 'Plan', 'BW Limit (MB)', '2FA', 'Sub Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(u => {
                const e = editing[u.id] || {};
                const dirty = !!editing[u.id];
                const bw = bwMap[u.id];
                const isExpanded = expandedBw === u.id;

                return (
                  <React.Fragment key={u.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-[#16191f] font-medium text-xs">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select value={e.adminRole ?? u.adminRole}
                          onChange={ev => set(u.id, 'adminRole', ev.target.value)}
                          className="bg-white border border-gray-300 text-[#16191f] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30">
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">{u.plan}</td>
                      <td className="px-5 py-4">
                        <input type="number" value={e.bandwidthLimitMb ?? u.bandwidthLimitMb}
                          onChange={ev => set(u.id, 'bandwidthLimitMb', Number(ev.target.value))}
                          className="w-24 bg-white border border-gray-300 text-[#16191f] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30" />
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold ${u.twoFactorEnabled ? 'text-green-700' : 'text-gray-400'}`}>
                          {u.twoFactorEnabled ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.subscription?.status === 'active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                          {u.subscription?.status ?? 'none'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => loadBandwidth(u.id)} title="View bandwidth usage"
                            className={`p-1.5 rounded-lg border transition-all ${isExpanded ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-200'}`}>
                            <BarChart2 className="w-3.5 h-3.5" />
                          </button>
                          {dirty && (
                            <button onClick={() => save(u.id)}
                              className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => disconnect(u.id)}
                            className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="px-5 py-4">
                          {bw ? (
                            <div className="space-y-2 max-w-md">
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>Bandwidth Usage</span>
                                <span className="font-bold text-[#16191f]">
                                  {bw.unlimited ? `${bw.usedMb} MB used (unlimited)` : `${bw.usedMb} / ${bw.limitMb} MB (${bw.pct}%)`}
                                </span>
                              </div>
                              {!bw.unlimited && (
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${bw.pct >= 90 ? 'bg-red-500' : bw.pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                    style={{ width: `${bw.pct}%` }}
                                  />
                                </div>
                              )}
                              {bw.unlimited && (
                                <div className="h-2 bg-green-200 rounded-full">
                                  <div className="h-full w-full bg-green-400 rounded-full" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No bandwidth data available.</span>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && <div className="py-16 text-center text-gray-400">No users found.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
