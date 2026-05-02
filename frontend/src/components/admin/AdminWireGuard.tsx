import { useEffect, useState } from 'react';
import { Loader2, Trash2, ToggleLeft, ToggleRight, Plus, QrCode, Download, X, SplitSquareHorizontal } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';

interface GeneratedPeer {
  peer: any;
  privateKey: string;
  configText: string;
}

const AdminWireGuard = () => {
  const [peers, setPeers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ userId: '', assignedIp: '', allowedIps: '0.0.0.0/0' });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPeer | null>(null);
  const [qrPeer, setQrPeer] = useState<GeneratedPeer | null>(null);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/wireguard'); setPeers(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const r = await api.post('/admin/wireguard/generate', genForm);
      setGenerated(r.data);
      setShowGenerate(false);
      setGenForm({ userId: '', assignedIp: '', allowedIps: '0.0.0.0/0' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const toggle = async (id: string, isActive: boolean) => {
    await api.patch(`/admin/wireguard/${id}`, { isActive: !isActive });
    load();
  };

  const toggleSplitTunnel = async (id: string, currentAllowedIps: string) => {
    const isSplit = currentAllowedIps !== '0.0.0.0/0';
    await api.patch(`/admin/wireguard/${id}`, { splitTunnel: !isSplit });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this peer permanently?')) return;
    await api.delete(`/admin/wireguard/${id}`);
    load();
  };

  const downloadConfig = (configText: string, name: string) => {
    const blob = new Blob([configText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.conf`;
    a.click();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#16191f]">WireGuard Peers</h1>
          <p className="text-gray-500 text-sm mt-0.5">Generate key pairs, QR codes & split-tunnel control</p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Generate Peer
        </button>
      </div>

      {/* Generate form */}
      {showGenerate && (
        <form onSubmit={generate} className="bg-white rounded-lg border border-blue-200 shadow-sm p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">User ID</label>
            <input value={genForm.userId} onChange={e => setGenForm(p => ({ ...p, userId: e.target.value }))} required
              placeholder="uuid of user"
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">Assigned IP</label>
            <input value={genForm.assignedIp} onChange={e => setGenForm(p => ({ ...p, assignedIp: e.target.value }))} required
              placeholder="10.0.0.2"
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">Allowed IPs</label>
            <input value={genForm.allowedIps} onChange={e => setGenForm(p => ({ ...p, allowedIps: e.target.value }))}
              placeholder="0.0.0.0/0"
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30" />
          </div>
          <div className="col-span-full flex gap-2 justify-end">
            <button type="button" onClick={() => setShowGenerate(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-[#16191f] transition-colors">Cancel</button>
            <button type="submit" disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm disabled:opacity-50">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </form>
      )}

      {/* Generated result */}
      {generated && (
        <div className="bg-white rounded-lg border border-green-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-green-700 font-bold text-sm">✓ Peer Generated — Save the private key now, it won't be shown again</h3>
            <button onClick={() => setGenerated(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Private Key (client only)</label>
              <code className="block bg-amber-50 rounded-lg p-3 text-amber-700 text-xs font-mono break-all border border-amber-200">{generated.privateKey}</code>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Public Key</label>
              <code className="block bg-blue-50 rounded-lg p-3 text-blue-700 text-xs font-mono break-all border border-blue-200">{generated.peer.publicKey}</code>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setQrPeer(generated)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-100 transition-all">
              <QrCode className="w-4 h-4" /> Show QR Code
            </button>
            <button onClick={() => downloadConfig(generated.configText, generated.peer.assignedIp)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all">
              <Download className="w-4 h-4" /> Download .conf
            </button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrPeer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setQrPeer(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-4 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[#16191f] font-bold">Scan with WireGuard App</h3>
              <button onClick={() => setQrPeer(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex justify-center bg-white p-4 rounded-xl border border-gray-200">
              <QRCodeSVG value={qrPeer.configText} size={220} />
            </div>
            <p className="text-gray-500 text-xs text-center">Open WireGuard → Add Tunnel → Scan QR Code</p>
            <button onClick={() => downloadConfig(qrPeer.configText, qrPeer.peer.assignedIp)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm">
              <Download className="w-4 h-4" /> Download .conf instead
            </button>
          </div>
        </div>
      )}

      {/* Peers table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-[10px] uppercase tracking-widest">
              <tr>
                {['User', 'Public Key', 'Assigned IP', 'Allowed IPs', 'Split Tunnel', 'Last Handshake', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-4 text-left font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {peers.map(p => {
                const isSplit = p.allowedIps !== '0.0.0.0/0';
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-[#16191f] text-xs">{p.user?.email ?? '—'}</td>
                    <td className="px-4 py-4">
                      <code className="text-blue-600 text-xs font-mono">{p.publicKey ? `${p.publicKey.slice(0, 14)}…` : '—'}</code>
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-mono text-xs">{p.assignedIp}</td>
                    <td className="px-4 py-4 text-gray-500 text-xs max-w-[120px] truncate">{p.allowedIps}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSplitTunnel(p.id, p.allowedIps)}
                        title={isSplit ? 'Split tunnel ON — click to disable' : 'Full tunnel — click to enable split'}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${isSplit ? 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 border-gray-200 text-gray-600 hover:border-amber-200'}`}>
                        <SplitSquareHorizontal className="w-3 h-3" />
                        {isSplit ? 'Split' : 'Full'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {p.lastHandshake ? new Date(p.lastHandshake).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle(p.id, p.isActive)}
                          className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 transition-all">
                          {p.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button onClick={() => remove(p.id)}
                          className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {peers.length === 0 && <div className="py-16 text-center text-gray-400">No WireGuard peers. Generate one above.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminWireGuard;
