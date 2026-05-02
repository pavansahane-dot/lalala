import { useState, useEffect } from 'react';
import { Wifi, Radio, Shield, Globe, Loader2, Check, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const VpnPreferencesTab = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    defaultProtocol: 'wireguard',
    ovpnPort: 'udp1194',
    wgKeepalive: 25,
    wgAllowedIPs: '0.0.0.0/0',
    dnsServer: '1.1.1.1,1.0.0.1',
    dnsProvider: 'cloudflare',
    customDns: '',
    killSwitch: true,
    ipv6Leak: true,
    dnsLeakProtection: true,
    obfuscation: false,
    preferredRegion: 'auto',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/user/settings');
      setSettings({
        defaultProtocol: data.defaultProtocol || 'wireguard',
        ovpnPort: data.ovpnPort || 'udp1194',
        wgKeepalive: data.wgKeepalive || 25,
        wgAllowedIPs: data.wgAllowedIPs || '0.0.0.0/0',
        dnsServer: data.dnsServer || '1.1.1.1,1.0.0.1',
        dnsProvider: getDnsProvider(data.dnsServer),
        customDns: '',
        killSwitch: data.killSwitch ?? true,
        ipv6Leak: data.ipv6Leak ?? true,
        dnsLeakProtection: data.dnsLeakProtection ?? true,
        obfuscation: data.obfuscation ?? false,
        preferredRegion: data.preferredRegion || 'auto',
      });
    } catch (err) {
      console.error('Failed to load VPN settings');
    }
  };

  const getDnsProvider = (dns: string) => {
    if (dns === '1.1.1.1,1.0.0.1') return 'cloudflare';
    if (dns === '8.8.8.8,8.8.4.4') return 'google';
    if (dns === '94.140.14.14,94.140.15.15') return 'adguard';
    return 'custom';
  };

  const handleDnsChange = (provider: string) => {
    const dnsMap: Record<string, string> = {
      cloudflare: '1.1.1.1,1.0.0.1',
      google: '8.8.8.8,8.8.4.4',
      adguard: '94.140.14.14,94.140.15.15',
      custom: settings.customDns || '8.8.8.8,1.1.1.1',
    };
    setSettings({ ...settings, dnsProvider: provider, dnsServer: dnsMap[provider] });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/user/settings/vpn', settings);
      toast.success('VPN preferences saved successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-400 font-semibold text-sm">Note</p>
          <p className="text-blue-400/80 text-sm mt-1">
            These preferences are applied to newly generated config files. Regenerate your configs after changing settings.
          </p>
        </div>
      </div>

      {/* Default Protocol */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-400" />
            Default Protocol
          </h2>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setSettings({ ...settings, defaultProtocol: 'openvpn' })}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              settings.defaultProtocol === 'openvpn'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-[#16191f] font-bold text-lg">OpenVPN</h3>
                <span className="text-xs text-blue-400">Stable & Compatible</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Works on all firewalls, highly configurable</p>
          </button>

          <button
            onClick={() => setSettings({ ...settings, defaultProtocol: 'wireguard' })}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              settings.defaultProtocol === 'wireguard'
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-[#16191f] font-bold text-lg">WireGuard</h3>
                <span className="text-xs text-green-400">Fast & Modern</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Fastest speeds, best for mobile devices</p>
          </button>
        </div>
      </div>

      {/* OpenVPN Port Preference */}
      {settings.defaultProtocol === 'openvpn' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              OpenVPN Port Preference
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {[
              { value: 'tcp80', label: 'TCP 80', desc: 'HTTP port, works on most networks' },
              { value: 'tcp443', label: 'TCP 443', desc: 'HTTPS port, recommended if VPN is blocked' },
              { value: 'udp53', label: 'UDP 53', desc: 'DNS port, good for bypassing restrictions' },
              { value: 'udp1194', label: 'UDP 1194', desc: 'Standard OpenVPN port, fastest' },
            ].map((port) => (
              <label key={port.value} className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
                <input
                  type="radio"
                  name="ovpnPort"
                  value={port.value}
                  checked={settings.ovpnPort === port.value}
                  onChange={(e) => setSettings({ ...settings, ovpnPort: e.target.value })}
                  className="w-5 h-5 text-blue-500"
                />
                <div className="flex-1">
                  <p className="text-[#16191f] font-semibold">{port.label}</p>
                  <p className="text-gray-600 text-sm">{port.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* WireGuard Settings */}
      {settings.defaultProtocol === 'wireguard' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#16191f]">WireGuard Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">PersistentKeepalive (seconds)</label>
              <input
                type="number"
                value={settings.wgKeepalive}
                onChange={(e) => setSettings({ ...settings, wgKeepalive: parseInt(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              />
              <p className="text-xs text-gray-600 mt-1">Recommended: 25 for mobile, 0 for desktop</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">AllowedIPs Mode</label>
              <div className="grid md:grid-cols-2 gap-3">
                <button
                  onClick={() => setSettings({ ...settings, wgAllowedIPs: '0.0.0.0/0' })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    settings.wgAllowedIPs === '0.0.0.0/0'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <p className="text-[#16191f] font-semibold">Full Tunnel</p>
                  <p className="text-gray-600 text-sm mt-1">All traffic through VPN (0.0.0.0/0)</p>
                </button>
                <button
                  onClick={() => setSettings({ ...settings, wgAllowedIPs: '10.8.0.0/24' })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    settings.wgAllowedIPs === '10.8.0.0/24'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <p className="text-[#16191f] font-semibold">Split Tunnel</p>
                  <p className="text-gray-600 text-sm mt-1">Only VPN subnet (10.8.0.0/24)</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DNS Settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            DNS Settings
          </h2>
        </div>
        <div className="p-6 space-y-3">
          {[
            { value: 'cloudflare', label: 'Cloudflare', dns: '1.1.1.1, 1.0.0.1', desc: 'Fast and privacy-focused' },
            { value: 'google', label: 'Google', dns: '8.8.8.8, 8.8.4.4', desc: 'Reliable and fast' },
            { value: 'adguard', label: 'AdGuard', dns: '94.140.14.14', desc: 'Blocks ads and trackers' },
          ].map((provider) => (
            <label key={provider.value} className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
              <input
                type="radio"
                name="dnsProvider"
                value={provider.value}
                checked={settings.dnsProvider === provider.value}
                onChange={(e) => handleDnsChange(e.target.value)}
                className="w-5 h-5 text-blue-500"
              />
              <div className="flex-1">
                <p className="text-[#16191f] font-semibold">{provider.label} — {provider.dns}</p>
                <p className="text-gray-600 text-sm">{provider.desc}</p>
              </div>
            </label>
          ))}
          
          <label className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
            <input
              type="radio"
              name="dnsProvider"
              value="custom"
              checked={settings.dnsProvider === 'custom'}
              onChange={(e) => handleDnsChange(e.target.value)}
              className="w-5 h-5 text-blue-500 mt-1"
            />
            <div className="flex-1">
              <p className="text-[#16191f] font-semibold mb-2">Custom DNS</p>
              <input
                type="text"
                value={settings.dnsProvider === 'custom' ? settings.dnsServer : settings.customDns}
                onChange={(e) => setSettings({ ...settings, customDns: e.target.value, dnsServer: e.target.value })}
                placeholder="8.8.8.8, 1.1.1.1"
                className="w-full bg-[#0a0f1e] border border-gray-300 rounded-lg px-4 py-2 text-[#16191f] focus:outline-none focus:border-[#ff9900]"
              />
            </div>
          </label>
        </div>
      </div>

      {/* Security Options */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Security Options
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'killSwitch', label: 'Kill Switch', desc: 'Blocks all traffic if VPN disconnects' },
            { key: 'ipv6Leak', label: 'IPv6 Leak Protection', desc: 'Prevents IPv6 leaks that expose your real IP' },
            { key: 'dnsLeakProtection', label: 'DNS Leak Protection', desc: 'Forces all DNS queries through VPN tunnel' },
            { key: 'obfuscation', label: 'Obfuscation (OpenVPN)', desc: 'Hides VPN traffic to bypass deep packet inspection' },
          ].map((option) => (
            <label key={option.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
              <div className="flex-1">
                <p className="text-[#16191f] font-semibold">{option.label}</p>
                <p className="text-gray-600 text-sm">{option.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, [option.key]: !settings[option.key as keyof typeof settings] })}
                className={`relative w-14 h-7 rounded-full transition-all ${
                  settings[option.key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings[option.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-0'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Default Server Region */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f]">Default Server Region</h2>
        </div>
        <div className="p-6">
          <select
            value={settings.preferredRegion}
            onChange={(e) => setSettings({ ...settings, preferredRegion: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
          >
            <option value="auto">Auto (Fastest)</option>
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="de">Germany</option>
            <option value="fr">France</option>
            <option value="jp">Japan</option>
            <option value="au">Australia</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#ff9900] hover:bg-[#e88b00] disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VpnPreferencesTab;
