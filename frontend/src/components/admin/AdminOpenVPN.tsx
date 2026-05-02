import { useEffect, useState } from 'react';
import { Loader2, Plus, ShieldOff, AlertTriangle, Download } from 'lucide-react';
import api from '../../api/axios';

const AdminOpenVPN = () => {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ userId: '', certName: '', commonName: '', expiresAt: '' });

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/openvpn'); setCerts(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/openvpn', form);
      setShowAdd(false);
      setForm({ userId: '', certName: '', commonName: '', expiresAt: '' });
      load();
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const revoke = async (id: string) => {
    if (!confirm('Revoke this certificate? This cannot be undone.')) return;
    await api.post(`/admin/openvpn/${id}/revoke`);
    load();
  };

  const downloadOvpn = async (id: string, certName: string) => {
    try {
      const r = await api.get(`/admin/openvpn/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([r.data], { type: 'text/plain' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certName}.ovpn`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Download failed');
    }
  };

  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const expiringSoon = certs.filter(c => !c.isRevoked && daysUntil(c.expiresAt) <= 30 && daysUntil(c.expiresAt) > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#16191f]">OpenVPN Certificates</h1>
          <p className="text-gray-500 text-sm mt-0.5">Issue, revoke, download .ovpn configs</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Issue Cert
        </button>
      </div>

      {/* Expiry warning banner */}
      {expiringSoon.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-amber-700 text-sm font-medium">
            {expiringSoon.length} certificate{expiringSoon.length > 1 ? 's' : ''} expiring within 30 days:&nbsp;
            <span className="font-mono">{expiringSoon.map(c => c.certName).join(', ')}</span>
          </p>
        </div>
      )}

      {/* Issue form */}
      {showAdd && (
        <form onSubmit={issue} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 grid grid-cols-2 gap-3">
          {[['userId', 'User ID'], ['certName', 'Cert Name'], ['commonName', 'Common Name']].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs text-gray-600 font-medium mb-1 block">{label}</label>
              <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} required
                className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">Expires At</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} required
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30" />
          </div>
          <div className="col-span-full flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-[#16191f] transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm">Issue</button>
          </div>
        </form>
      )}

      {/* Certs table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-[10px] uppercase tracking-widest">
              <tr>
                {['User', 'Cert Name', 'Common Name', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {certs.map(c => {
                const days = daysUntil(c.expiresAt);
                const expiring = !c.isRevoked && days <= 30 && days > 0;
                const expired = days <= 0;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-[#16191f] text-xs">{c.user?.email ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600 font-mono text-xs">{c.certName}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{c.commonName}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {(expiring || expired) && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        <span className={`text-xs font-medium ${expired ? 'text-red-700' : expiring ? 'text-amber-700' : 'text-gray-500'}`}>
                          {expired ? `Expired ${Math.abs(days)}d ago` : `${days}d left`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.isRevoked ? 'bg-red-100 text-red-700 border border-red-200' : expired ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                        {c.isRevoked ? 'Revoked' : expired ? 'Expired' : 'Valid'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {!c.isRevoked && !expired && (
                          <button onClick={() => downloadOvpn(c.id, c.certName)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
                            <Download className="w-3.5 h-3.5" /> .ovpn
                          </button>
                        )}
                        {!c.isRevoked && (
                          <button onClick={() => revoke(c.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-all">
                            <ShieldOff className="w-3.5 h-3.5" /> Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {certs.length === 0 && <div className="py-16 text-center text-gray-400">No certificates found.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminOpenVPN;
