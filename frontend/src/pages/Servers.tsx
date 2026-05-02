import { useEffect, useState } from 'react';
import { Globe, Server, Activity, Loader2, AlertCircle, CheckCircle, XCircle, Download, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const Servers = () => {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedServer, setConnectedServer] = useState<string | null>(null);
  const [connectError, setConnectError] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/servers')
      .then(r => { setServers(r.data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (node: any) => {
    setConnecting(node.id);
    setConnectError('');
    try {
      // Use configs/generate which handles key gen + peer creation + returns config
      const r = await api.post(`/configs/generate/${node.id}`);
      const { configText } = r.data;

      // Download the config file
      const blob = new Blob([configText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zerotrace-${node.city.toLowerCase().replace(/\s+/g, '-')}.conf`;
      a.click();
      URL.revokeObjectURL(url);

      setConnectedServer(node.id);
      // Navigate to configs tab after short delay so user sees the success state
      setTimeout(() => navigate('/configs'), 1200);
    } catch (err: any) {
      setConnectError(err.response?.data?.error || 'Failed to connect. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff9900] mx-auto" />
        <p className="text-gray-500 text-sm">Scanning network nodes…</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#16191f]">{t.globalNetworkNodes}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t.realTimeStatus}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded text-xs font-bold text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          {t.systemsOperational}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t.unableToConnect}
        </div>
      )}

      {connectError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {connectError}
        </div>
      )}

      {connectedServer && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded p-4 text-green-700 text-sm">
          <Download className="w-4 h-4 shrink-0" />
          Config downloaded! Redirecting to Configurations tab…
        </div>
      )}

      {servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map(node => {
            const isConnecting = connecting === node.id;
            const isConnected = connectedServer === node.id;
            return (
              <div key={node.id} className={`bg-white border rounded shadow-sm hover:shadow-md transition-all ${isConnected ? 'border-green-300' : 'border-gray-200 hover:border-[#ff9900]/40'}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#f2f3f3] border border-gray-200 rounded flex items-center justify-center text-xs font-black text-[#16191f]">
                      {node.country.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[#16191f] text-sm">{node.city}</div>
                      <div className="text-gray-400 text-xs uppercase tracking-wide">{node.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {node.isActive
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className={`text-xs font-bold ${node.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {node.isActive ? t.provisioned : t.offline}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500"><Globe className="w-3.5 h-3.5" />{t.ipAddress}</span>
                    <code className="font-mono text-[#16191f] bg-[#f2f3f3] px-2 py-0.5 rounded border border-gray-200">{node.ip}</code>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Activity className="w-3.5 h-3.5" />{t.networkLoad}
                      </span>
                      <span className={`font-bold ${node.load > 80 ? 'text-red-500' : 'text-green-600'}`}>{node.load}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 border border-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${node.load > 80 ? 'bg-red-400' : 'bg-green-500'}`}
                        style={{ width: `${node.load}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#fff8ec] border border-[#ff9900]/30 rounded text-[10px] font-bold text-[#cc7a00] uppercase">
                      {node.protocol === 'WG' ? 'WireGuard' : node.protocol}
                    </span>
                    {isConnected ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                        <Wifi className="w-3.5 h-3.5" /> Config Downloaded
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConnect(node)}
                        disabled={!node.isActive || isConnecting || !!connecting}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff9900] hover:bg-[#e88b00] text-black text-xs font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isConnecting
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Connecting…</>
                          : <><Download className="w-3 h-3" /> {t.selectLocation}</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !error ? (
        <div className="bg-white border border-dashed border-gray-300 rounded p-16 text-center">
          <Server className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-500 text-sm">{t.noActiveInfrastructure}</h3>
          <p className="text-gray-400 text-xs mt-1">{t.onboardNode}</p>
        </div>
      ) : null}
    </div>
  );
};

export default Servers;
