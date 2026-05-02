import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download, Zap, Shield, Copy, CheckCircle, X,
  RefreshCw, Globe, Activity, Server, AlertCircle
} from 'lucide-react';
import PublicNav from '../components/PublicNav';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface VpnServer {
  id: string;
  country: string;
  city: string;
  ip: string;
  protocol: string;
  load: number;
  cpuUsage: number;
  lastSeen: string;
}

interface Credentials { username: string; password: string; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const countryFlag: Record<string, string> = {
  India: '🇮🇳', 'United States': '🇺🇸', Germany: '🇩🇪',
  Netherlands: '🇳🇱', Singapore: '🇸🇬', Japan: '🇯🇵',
  'United Kingdom': '🇬🇧', France: '🇫🇷', Canada: '🇨🇦',
};
const getFlag = (country: string) => countryFlag[country] ?? '🌐';

const LoadBar = ({ pct }: { pct: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${pct < 50 ? 'bg-green-400' : pct < 80 ? 'bg-yellow-400' : 'bg-red-400'}`}
        style={{ width: `${pct}%` }} />
    </div>
    <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
  </div>
);

// ── QR Modal ──────────────────────────────────────────────────────────────────
const QrModal = ({ configText, serverName, onClose }: { configText: string; serverName: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#16191f]">WireGuard QR Code</h3>
          <p className="text-xs text-gray-500">{serverName}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-center p-4 bg-white border border-gray-200 rounded mb-4">
        <QRCodeSVG value={configText} size={220} level="M" />
      </div>
      <p className="text-xs text-gray-500 text-center mb-4">
        Open WireGuard app → tap <strong>+</strong> → <strong>Scan QR code</strong>
      </p>
      <button
        onClick={() => { navigator.clipboard.writeText(configText); toast.success('Config copied!'); }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <Copy className="w-4 h-4" /> Copy Config Text
      </button>
    </div>
  </div>
);

// ── OpenVPN Tab ───────────────────────────────────────────────────────────────
const OpenVpnTab = ({ servers, creds }: { servers: VpnServer[]; creds: Credentials | null }) => {
  const [copied, setCopied] = useState<'user' | 'pass' | null>(null);

  const copy = (text: string, field: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSingle = (serverId: string, proto: string, port: string) => {
    window.open(`http://localhost:5000/api/vpn/config/openvpn?serverId=${serverId}&proto=${proto}&port=${port}`, '_blank');
  };

  const downloadZip = (serverId: string) => {
    window.open(`http://localhost:5000/api/vpn/config/openvpn/zip?serverId=${serverId}`, '_blank');
    toast.success('Downloading ZIP bundle…');
  };

  return (
    <div className="space-y-6">
      {/* Shared credentials box */}
      {creds && (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#ff9900]" />
            <h3 className="font-bold text-[#16191f] text-sm">Shared OpenVPN Credentials</h3>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Use with all configs</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Username', value: creds.username, field: 'user' as const },
              { label: 'Password', value: creds.password, field: 'pass' as const },
            ].map(({ label, value, field }) => (
              <div key={field} className="flex items-center gap-2 bg-[#f2f3f3] border border-gray-200 rounded px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                  <div className="font-mono font-bold text-[#16191f] text-sm">{value}</div>
                </div>
                <button onClick={() => copy(value, field)}
                  className="text-gray-400 hover:text-[#ff9900] transition-colors shrink-0">
                  {copied === field ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            ⚠️ These are shared credentials. <a href="/signup" className="text-[#ff9900] hover:underline">Create an account</a> for dedicated per-user configs.
          </p>
        </div>
      )}

      {/* Server cards */}
      <div className="space-y-3">
        {servers.map(server => (
          <div key={server.id} className="bg-white border border-gray-200 rounded shadow-sm p-5">
            <div className="flex items-start gap-4">
              <span className="text-3xl mt-0.5">{getFlag(server.country)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#16191f]">{server.city}</span>
                  <span className="text-xs text-gray-400">{server.country}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span>IP: {server.ip}</span>
                  <span>CPU: {server.cpuUsage.toFixed(0)}%</span>
                </div>
                <LoadBar pct={server.load} />
              </div>
            </div>

            {/* Download buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => downloadSingle(server.id, 'tcp', '80')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f2f3f3] hover:bg-gray-200 border border-gray-200 rounded text-xs font-medium text-[#16191f] transition-colors">
                  <Download className="w-3.5 h-3.5" /> TCP 80
                </button>
                <button onClick={() => downloadSingle(server.id, 'tcp', '443')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f2f3f3] hover:bg-gray-200 border border-gray-200 rounded text-xs font-medium text-[#16191f] transition-colors">
                  <Download className="w-3.5 h-3.5" /> TCP 443
                </button>
                <button onClick={() => downloadSingle(server.id, 'udp', '53')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f2f3f3] hover:bg-gray-200 border border-gray-200 rounded text-xs font-medium text-[#16191f] transition-colors">
                  <Download className="w-3.5 h-3.5" /> UDP 53
                </button>
                <button onClick={() => downloadSingle(server.id, 'udp', '1194')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f2f3f3] hover:bg-gray-200 border border-gray-200 rounded text-xs font-medium text-[#16191f] transition-colors">
                  <Download className="w-3.5 h-3.5" /> UDP 1194
                </button>
                <button onClick={() => downloadZip(server.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff9900] hover:bg-[#e88b00] rounded text-xs font-bold text-black transition-colors ml-auto">
                  <Download className="w-3.5 h-3.5" /> Download All as ZIP
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── WireGuard Tab ─────────────────────────────────────────────────────────────
const WireGuardTab = ({ servers }: { servers: VpnServer[] }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ configText: string; serverName: string } | null>(null);

  const generate = async (serverId: string, serverName: string, action: 'download' | 'qr') => {
    setLoading(`${serverId}-${action}`);
    try {
      const { data } = await api.post('/vpn/config/wireguard', {
        serverId,
        deviceName: `Anonymous-${Date.now()}`,
      });

      if (action === 'download') {
        const blob = new Blob([data.configText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zerotrace-wg-${serverName.toLowerCase().replace(/\s+/g, '-')}.conf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('WireGuard config downloaded!');
      } else {
        setQrModal({ configText: data.configText, serverName });
      }
    } catch {
      toast.error('Failed to generate config. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info box */}
      <div className="bg-orange-50 border border-orange-200 rounded p-4 flex gap-3">
        <Zap className="w-5 h-5 text-[#ff9900] shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-orange-800 mb-1">WireGuard — Fast &amp; Modern</p>
          <p className="text-orange-700">
            Each click generates a fresh keypair unique to you. Download the <code className="bg-orange-100 px-1 rounded">.conf</code> file
            or scan the QR code directly in the WireGuard mobile app.
            <a href="/signup" className="text-[#ff9900] font-bold hover:underline ml-1">
              Create an account
            </a> to save configs and manage devices.
          </p>
        </div>
      </div>

      {/* Server cards */}
      <div className="space-y-3">
        {servers.map(server => (
          <div key={server.id} className="bg-white border border-gray-200 rounded shadow-sm p-5">
            <div className="flex items-start gap-4">
              <span className="text-3xl mt-0.5">{getFlag(server.country)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#16191f]">{server.city}</span>
                  <span className="text-xs text-gray-400">{server.country}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span>UDP 51820</span>
                  <span>CPU: {server.cpuUsage.toFixed(0)}%</span>
                </div>
                <LoadBar pct={server.load} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => generate(server.id, server.city, 'download')}
                disabled={!!loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#f2f3f3] hover:bg-gray-200 border border-gray-200 rounded text-sm font-medium text-[#16191f] transition-colors disabled:opacity-50">
                {loading === `${server.id}-download`
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />}
                Download .conf
              </button>
              <button
                onClick={() => generate(server.id, server.city, 'qr')}
                disabled={!!loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] rounded text-sm font-bold text-black transition-colors disabled:opacity-50">
                {loading === `${server.id}-qr`
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Globe className="w-4 h-4" />}
                Show QR Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {qrModal && (
        <QrModal
          configText={qrModal.configText}
          serverName={qrModal.serverName}
          onClose={() => setQrModal(null)}
        />
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const FreeVpn = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'openvpn' | 'wireguard'>('openvpn');
  const [servers, setServers] = useState<VpnServer[]>([]);
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          api.get('/vpn/servers'),
          api.get('/vpn/credentials'),
        ]);
        setServers(sRes.data);
        setCreds(cRes.data);
      } catch {
        setError('Failed to load servers. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex flex-col">
      <PublicNav />

      {/* Page header */}
      <div className="bg-[#232f3e] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-[#ff9900] text-xs font-bold uppercase tracking-widest mb-2">
            <Shield className="w-4 h-4" /> Free VPN Service
          </div>
          <h1 className="text-3xl font-black mb-2">Download VPN Configs</h1>
          <p className="text-white/60 text-sm">
            No account required. Pick a server, download your config, connect. That's it.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Protocol tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded p-1 mb-6 w-fit shadow-sm">
          <button
            onClick={() => setTab('openvpn')}
            className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-bold transition-all ${
              tab === 'openvpn'
                ? 'bg-[#232f3e] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#16191f]'
            }`}>
            <Shield className="w-4 h-4" /> OpenVPN
          </button>
          <button
            onClick={() => setTab('wireguard')}
            className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-bold transition-all ${
              tab === 'wireguard'
                ? 'bg-[#232f3e] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#16191f]'
            }`}>
            <Zap className="w-4 h-4" /> WireGuard
          </button>
        </div>

        {/* Protocol info strip */}
        {tab === 'openvpn' && (
          <div className="flex flex-wrap gap-3 mb-6 text-xs">
            {['TCP 80', 'TCP 443', 'UDP 53', 'UDP 1194'].map(p => (
              <span key={p} className="flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded font-medium text-gray-600">
                <Activity className="w-3 h-3 text-[#ff9900]" /> {p}
              </span>
            ))}
            <span className="flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded font-medium text-gray-600">
              <Shield className="w-3 h-3 text-blue-500" /> AES-256-GCM
            </span>
          </div>
        )}
        {tab === 'wireguard' && (
          <div className="flex flex-wrap gap-3 mb-6 text-xs">
            {['UDP 51820', 'ChaCha20', 'Curve25519', 'QR Code Setup'].map(p => (
              <span key={p} className="flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded font-medium text-gray-600">
                <Zap className="w-3 h-3 text-[#ff9900]" /> {p}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-[#ff9900] animate-spin mr-3" />
            <span className="text-gray-500 text-sm">Loading servers…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        ) : servers.length === 0 ? (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-700 text-sm">
            <Server className="w-5 h-5 shrink-0" /> No active servers found. Please check back soon.
          </div>
        ) : tab === 'openvpn' ? (
          <OpenVpnTab servers={servers} creds={creds} />
        ) : (
          <WireGuardTab servers={servers} />
        )}
      </div>
    </div>
  );
};

export default FreeVpn;
