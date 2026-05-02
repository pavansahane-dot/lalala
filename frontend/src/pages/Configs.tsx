import { useEffect, useState } from 'react';
import { Download, Loader2, ServerCrash, AlertCircle, ExternalLink, Plus, Wifi } from 'lucide-react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

interface Server { id: string; ip: string; country: string; city: string; protocol: string; isActive: boolean; }
interface Device { id: string; deviceName: string; assignedIP: string | null; isRevoked: boolean; createdAt: string; }

const Configurations = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingServers, setLoadingServers] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [genError, setGenError] = useState('');
  const { t } = useLanguage();

  const loadDevices = () => {
    setLoadingDevices(true);
    api.get('/vpn/user/devices')
      .then(r => setDevices(r.data.filter((d: Device) => !d.isRevoked)))
      .catch(() => {})
      .finally(() => setLoadingDevices(false));
  };

  useEffect(() => {
    api.get('/servers')
      .then(res => {
        const active = res.data.filter((s: Server) => s.isActive);
        setServers(active);
        if (active.length > 0) setSelectedId(active[0].id);
        setApiError(false);
      })
      .catch(() => setApiError(true))
      .finally(() => setLoadingServers(false));
    loadDevices();
  }, []);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setIsGenerating(true);
    setGenError('');
    try {
      const r = await api.post(`/configs/generate/${selectedId}`);
      const { configText } = r.data;
      const server = servers.find(s => s.id === selectedId);
      const blob = new Blob([configText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zerotrace-${server?.city.toLowerCase().replace(/\s+/g, '-') ?? 'vpn'}.conf`;
      a.click();
      URL.revokeObjectURL(url);
      loadDevices();
    } catch (e: any) {
      setGenError(e.response?.data?.error || 'Failed to generate config. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#16191f]">{t.configurations}</h1>
        <p className="text-gray-500 text-sm mt-1">Generate WireGuard configs and manage your VPN connections.</p>
      </div>

      {/* Client download links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { href: 'https://www.wireguard.com/install/', label: t.get_wireguard, sub: 'wireguard.com', color: 'text-green-600' },
          { href: 'https://openvpn.net/community-downloads/', label: t.get_openvpn, sub: 'openvpn.net', color: 'text-blue-600' },
        ].map(({ href, label, sub, color }) => (
          <a key={href} href={href} target="_blank" rel="noreferrer"
            className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center gap-3 hover:border-[#ff9900]/50 hover:shadow-md transition-all">
            <div className="w-8 h-8 bg-[#f2f3f3] border border-gray-200 rounded flex items-center justify-center shrink-0">
              <ExternalLink className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <div className="text-[#16191f] font-semibold text-sm">{label}</div>
              <div className="text-gray-400 text-xs">{sub}</div>
            </div>
          </a>
        ))}
      </div>

      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{t.unableToConnect}
        </div>
      )}

      {genError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{genError}
        </div>
      )}

      {/* Config generator */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-4 h-4 text-[#ff9900]" />
          <span className="font-bold text-[#16191f] text-sm uppercase tracking-wide">Generate New Config</span>
        </div>

        {loadingServers ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading live nodes…
          </div>
        ) : !apiError && servers.length === 0 ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded p-4 text-amber-700 text-sm">
            <ServerCrash className="w-4 h-4 shrink-0" />
            {t.noActiveInfrastructure} — {t.onboardNode}
          </div>
        ) : !apiError ? (
          <div className="space-y-3">
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all cursor-pointer">
              {servers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.country} — {s.city} ({s.ip}) [{s.protocol}]
                </option>
              ))}
            </select>
            <button onClick={handleGenerate} disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black text-sm font-bold rounded transition-all shadow-sm disabled:opacity-60">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {t.download_config}
            </button>
            <p className="text-xs text-gray-400">A new WireGuard peer will be created and the config downloaded automatically.</p>
          </div>
        ) : null}
      </div>

      {/* Connected devices */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-[#ff9900]" />
          <span className="font-bold text-[#16191f] text-sm uppercase tracking-wide">Connected Devices</span>
          <span className="ml-auto text-xs text-gray-400">{devices.length} connected</span>
        </div>

        {loadingDevices ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : devices.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No active connections.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {devices.map(d => (
              <div key={d.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <div>
                    <div className="text-[#16191f] font-medium text-sm">{d.deviceName}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {d.assignedIP && (
                        <code className="text-xs bg-[#f2f3f3] px-2 py-0.5 rounded border border-gray-200 font-mono">{d.assignedIP}</code>
                      )}
                      <span className="text-xs text-gray-400">Since {new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-600 border border-green-200">Connected</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Configurations;
