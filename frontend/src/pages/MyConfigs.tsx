import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield, Zap, Download, RefreshCw, X, Copy, CheckCircle,
  Trash2, Smartphone, AlertCircle, Loader2, Plus, Wifi
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

interface Server  { id: string; country: string; city: string; ip: string; protocol: string; load: number; }
interface Device  { id: string; deviceName: string; protocol: string; serverId: string; assignedIP: string | null; isRevoked: boolean; createdAt: string; wgPublicKey: string | null; }
interface Creds   { username: string; password: string; }

const countryFlag: Record<string, string> = {
  India: '🇮🇳', 'United States': '🇺🇸', Germany: '🇩🇪',
  Netherlands: '🇳🇱', Singapore: '🇸🇬', Japan: '🇯🇵',
};
const getFlag = (country: string) => countryFlag[country] ?? '🌐';

// ── QR Modal ──────────────────────────────────────────────────────────────────
const QrModal = ({ configText, deviceName, onClose }: { configText: string; deviceName: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#16191f]">WireGuard QR Code</h3>
          <p className="text-xs text-gray-500">{deviceName}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex justify-center p-4 bg-white border border-gray-200 rounded mb-4">
        <QRCodeSVG value={configText} size={220} level="M" />
      </div>
      <p className="text-xs text-gray-500 text-center mb-4">
        Open WireGuard app → tap <strong>+</strong> → <strong>Scan QR code</strong>
      </p>
      <button onClick={() => { navigator.clipboard.writeText(configText); toast.success('Config copied!'); }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <Copy className="w-4 h-4" /> Copy Config Text
      </button>
    </div>
  </div>
);

// ── OpenVPN Tab ───────────────────────────────────────────────────────────────
const OpenVpnTab = ({ servers, creds }: { servers: Server[]; creds: Creds | null }) => {
  const [selectedId, setSelectedId] = useState(servers[0]?.id ?? '');
  const [copied, setCopied] = useState<'user' | 'pass' | null>(null);

  const copy = (text: string, field: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const download = (proto: string, port: string) => {
    window.open(`http://localhost:5000/api/vpn/config/openvpn?serverId=${selectedId}&proto=${proto}&port=${port}`, '_blank');
  };

  const downloadZip = () => {
    window.open(`http://localhost:5000/api/vpn/config/openvpn/zip?serverId=${selectedId}`, '_blank');
    toast.success('Downloading ZIP bundle…');
  };

  useEffect(() => { if (servers.length > 0) setSelectedId(servers[0].id); }, [servers]);

  return (
    <div className="space-y-5">
      {/* Credentials */}
      {creds && (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#ff9900]" />
            <span className="font-bold text-[#16191f] text-sm">Shared OpenVPN Credentials</span>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Use with all configs</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([['Username', creds.username, 'user'], ['Password', creds.password, 'pass']] as const).map(([label, val, field]) => (
              <div key={field} className="flex items-center gap-2 bg-[#f2f3f3] border border-gray-200 rounded px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                  <div className="font-mono font-bold text-[#16191f] text-sm">{val}</div>
                </div>
                <button onClick={() => copy(val, field)} className="text-gray-400 hover:text-[#ff9900] transition-colors shrink-0">
                  {copied === field ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Server selector + download */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-[#ff9900]" />
          <span className="font-bold text-[#16191f] text-sm">Download Config</span>
        </div>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
          className="w-full border border-gray-300 text-[#16191f] text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/20 transition-all">
          {servers.map(s => (
            <option key={s.id} value={s.id}>{getFlag(s.country)} {s.city}, {s.country} — Load {s.load}%</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {[['tcp','80'],['tcp','443'],['udp','53'],['udp','1194']].map(([p, port]) => (
            <button key={`${p}${port}`} onClick={() => download(p, port)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f2f3f3] hover:bg-gray-200 border border-gray-200 rounded text-xs font-medium text-[#16191f] transition-colors">
              <Download className="w-3.5 h-3.5" /> {p.toUpperCase()} {port}
            </button>
          ))}
          <button onClick={downloadZip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff9900] hover:bg-[#e88b00] rounded text-xs font-bold text-black transition-colors ml-auto">
            <Download className="w-3.5 h-3.5" /> All as ZIP
          </button>
        </div>
      </div>
    </div>
  );
};

// ── WireGuard Tab ─────────────────────────────────────────────────────────────
const WireGuardTab = ({ servers, devices, onDevicesChange }: {
  servers: Server[];
  devices: Device[];
  onDevicesChange: () => void;
}) => {
  const { user } = useAuthStore();
  const [deviceName, setDeviceName] = useState('');
  const [selectedId, setSelectedId] = useState(servers[0]?.id ?? '');
  const [generating, setGenerating] = useState(false);
  const [qrModal, setQrModal] = useState<{ configText: string; deviceName: string } | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => { if (servers.length > 0) setSelectedId(servers[0].id); }, [servers]);

  const generate = async () => {
    if (!deviceName.trim()) { toast.error('Enter a device name first.'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post('/vpn/config/wireguard', {
        serverId: selectedId,
        deviceName: deviceName.trim(),
        userId: user?.id ?? null,
      });

      // Download .conf
      const blob = new Blob([data.configText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zerotrace-${deviceName.trim().toLowerCase().replace(/\s+/g, '-')}.conf`;
      a.click();
      URL.revokeObjectURL(url);

      // Show QR immediately
      setQrModal({ configText: data.configText, deviceName: deviceName.trim() });
      setDeviceName('');
      onDevicesChange();
      toast.success('WireGuard config generated!');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to generate config.');
    } finally {
      setGenerating(false);
    }
  };

  const revoke = async (deviceId: string, name: string) => {
    if (!confirm(`Revoke "${name}"? This will disconnect the device.`)) return;
    setRevoking(deviceId);
    try {
      await api.delete(`/vpn/user/devices/${deviceId}`);
      toast.success(`"${name}" revoked.`);
      onDevicesChange();
    } catch {
      toast.error('Failed to revoke device.');
    } finally {
      setRevoking(null);
    }
  };

  const showQr = async (deviceId: string, name: string) => {
    try {
      const { data } = await api.get(`/vpn/config/wireguard/qr?deviceId=${deviceId}`);
      setQrModal({ configText: data.configText, deviceName: name });
    } catch {
      toast.error('Failed to load QR code.');
    }
  };

  const activeDevices = devices.filter(d => d.protocol === 'wireguard' && !d.isRevoked);
  const revokedDevices = devices.filter(d => d.protocol === 'wireguard' && d.isRevoked);

  return (
    <div className="space-y-5">
      {/* Generator */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#ff9900]" />
          <span className="font-bold text-[#16191f] text-sm">Generate New Config</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Device Name</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={deviceName} onChange={e => setDeviceName(e.target.value)}
                placeholder="e.g. iPhone 15, Laptop"
                className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Server</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full border border-gray-300 text-[#16191f] text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/20 transition-all">
              {servers.map(s => (
                <option key={s.id} value={s.id}>{getFlag(s.country)} {s.city} — {s.load}% load</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={generate} disabled={generating || !deviceName.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-sm rounded transition-all disabled:opacity-50 shadow-sm">
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {generating ? 'Generating…' : 'Generate & Download'}
        </button>
        <p className="text-xs text-gray-400">A unique keypair is generated for this device. The .conf file downloads automatically and the QR code is shown.</p>
      </div>

      {/* Active devices table */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-[#ff9900]" />
          <span className="font-bold text-[#16191f] text-sm">Active Devices</span>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{activeDevices.length}</span>
        </div>
        {activeDevices.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No active devices. Generate a config above.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeDevices.map(d => (
              <div key={d.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-8 h-8 bg-[#fff8ec] border border-[#ff9900]/20 rounded flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-[#ff9900]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#16191f] text-sm">{d.deviceName}</div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    {d.assignedIP && <code className="bg-[#f2f3f3] border border-gray-200 px-1.5 py-0.5 rounded font-mono">{d.assignedIP}</code>}
                    <span>Created {new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => showQr(d.id, d.deviceName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:border-[#ff9900]/50 hover:text-[#ff9900] transition-colors">
                    QR Code
                  </button>
                  <button onClick={() => revoke(d.id, d.deviceName)} disabled={revoking === d.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded text-xs font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                    {revoking === d.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {qrModal && <QrModal configText={qrModal.configText} deviceName={qrModal.deviceName} onClose={() => setQrModal(null)} />}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyConfigs = () => {
  const [tab, setTab] = useState<'openvpn' | 'wireguard'>('wireguard');
  const [servers, setServers] = useState<Server[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [creds, setCreds] = useState<Creds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDevices = async () => {
    try {
      const { data } = await api.get('/vpn/user/devices');
      setDevices(data.filter((d: Device) => !d.isRevoked));
    } catch { /* silent */ }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [sRes, cRes] = await Promise.all([api.get('/vpn/servers'), api.get('/vpn/credentials')]);
        setServers(sRes.data);
        setCreds(cRes.data);
        await loadDevices();
      } catch {
        setError('Failed to load. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#ff9900]" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#16191f]">My VPN Configs</h1>
        <p className="text-gray-500 text-sm mt-1">Generate and manage your personal VPN configurations.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Protocol tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded p-1 w-fit shadow-sm">
        <button onClick={() => setTab('wireguard')}
          className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-bold transition-all ${tab === 'wireguard' ? 'bg-[#232f3e] text-white' : 'text-gray-500 hover:text-[#16191f]'}`}>
          <Zap className="w-4 h-4" /> WireGuard
        </button>
        <button onClick={() => setTab('openvpn')}
          className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-bold transition-all ${tab === 'openvpn' ? 'bg-[#232f3e] text-white' : 'text-gray-500 hover:text-[#16191f]'}`}>
          <Shield className="w-4 h-4" /> OpenVPN
        </button>
      </div>

      {servers.length === 0 && !error ? (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> No active servers found.
        </div>
      ) : tab === 'wireguard' ? (
        <WireGuardTab servers={servers} devices={devices} onDevicesChange={loadDevices} />
      ) : (
        <OpenVpnTab servers={servers} creds={creds} />
      )}
    </div>
  );
};

export default MyConfigs;
