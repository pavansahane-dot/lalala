import { useState } from 'react';
import { Download, ExternalLink, CheckCircle, Monitor, Smartphone, Apple, Terminal } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import { useLanguage } from '../context/LanguageContext';

type OS = 'windows' | 'macos' | 'ios' | 'android' | 'linux';
type Protocol = 'wireguard' | 'openvpn';

const OS_LIST: { id: OS; label: string; icon: React.ReactNode }[] = [
  { id: 'windows', label: 'Windows',  icon: <Monitor className="w-5 h-5" /> },
  { id: 'macos',   label: 'macOS',    icon: <Apple className="w-5 h-5" /> },
  { id: 'ios',     label: 'iOS',      icon: <Smartphone className="w-5 h-5" /> },
  { id: 'android', label: 'Android',  icon: <Smartphone className="w-5 h-5" /> },
  { id: 'linux',   label: 'Linux',    icon: <Terminal className="w-5 h-5" /> },
];

// ── Guide data ────────────────────────────────────────────────────────────────
const GUIDES: Record<OS, Record<Protocol, { steps: string[]; downloadUrl: string; downloadLabel: string; note?: string }>> = {
  windows: {
    wireguard: {
      downloadUrl: 'https://www.wireguard.com/install/',
      downloadLabel: 'Download WireGuard for Windows',
      steps: [
        'Download and install the WireGuard client from the official site.',
        'Go to ZeroTraceVPN → Free VPN → WireGuard tab.',
        'Click "Download .conf" on your chosen server.',
        'Open WireGuard → click "Import tunnel(s) from file".',
        'Select the downloaded .conf file.',
        'Click "Activate" to connect. Your IP is now hidden.',
      ],
    },
    openvpn: {
      downloadUrl: 'https://openvpn.net/community-downloads/',
      downloadLabel: 'Download OpenVPN for Windows',
      steps: [
        'Download and install OpenVPN Community client.',
        'Go to ZeroTraceVPN → Free VPN → OpenVPN tab.',
        'Click "Download All as ZIP" and extract the files.',
        'Copy the .ovpn files to: C:\\Program Files\\OpenVPN\\config\\',
        'Right-click the OpenVPN tray icon → Connect.',
        'Enter the shared credentials when prompted.',
      ],
      note: 'Tip: Use TCP 443 if other ports are blocked on your network.',
    },
  },
  macos: {
    wireguard: {
      downloadUrl: 'https://apps.apple.com/us/app/wireguard/id1451685025',
      downloadLabel: 'Download WireGuard from Mac App Store',
      steps: [
        'Install WireGuard from the Mac App Store.',
        'Go to ZeroTraceVPN → Free VPN → WireGuard tab.',
        'Click "Download .conf" on your chosen server.',
        'Open WireGuard → File → Import Tunnel(s) from File.',
        'Select the .conf file and click "Allow" for VPN permissions.',
        'Toggle the tunnel ON to connect.',
      ],
    },
    openvpn: {
      downloadUrl: 'https://tunnelblick.net/downloads.html',
      downloadLabel: 'Download Tunnelblick (OpenVPN for macOS)',
      steps: [
        'Install Tunnelblick from tunnelblick.net.',
        'Download the OpenVPN ZIP from ZeroTraceVPN.',
        'Double-click any .ovpn file — Tunnelblick will import it.',
        'Click the Tunnelblick icon in the menu bar → Connect.',
        'Enter the shared credentials when prompted.',
      ],
    },
  },
  ios: {
    wireguard: {
      downloadUrl: 'https://apps.apple.com/us/app/wireguard/id1441195209',
      downloadLabel: 'Download WireGuard from App Store',
      steps: [
        'Install WireGuard from the App Store.',
        'On ZeroTraceVPN, go to Free VPN → WireGuard tab.',
        'Tap "Show QR Code" on your chosen server.',
        'Open WireGuard app → tap the + button → "Create from QR code".',
        'Scan the QR code shown on screen.',
        'Tap "Allow" for VPN permissions, then toggle ON.',
      ],
      note: 'QR code is the fastest way to set up on iOS — no file transfer needed.',
    },
    openvpn: {
      downloadUrl: 'https://apps.apple.com/us/app/openvpn-connect/id590379981',
      downloadLabel: 'Download OpenVPN Connect from App Store',
      steps: [
        'Install OpenVPN Connect from the App Store.',
        'Download a .ovpn file from ZeroTraceVPN on your computer.',
        'AirDrop or email the .ovpn file to your iPhone.',
        'Tap the file → "Open in OpenVPN".',
        'Tap "Add" then enter the shared credentials.',
        'Tap the toggle to connect.',
      ],
    },
  },
  android: {
    wireguard: {
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.wireguard.android',
      downloadLabel: 'Download WireGuard from Play Store',
      steps: [
        'Install WireGuard from the Google Play Store.',
        'On ZeroTraceVPN, go to Free VPN → WireGuard tab.',
        'Tap "Show QR Code" on your chosen server.',
        'Open WireGuard → tap the + button → "Scan from QR code".',
        'Scan the QR code shown on screen.',
        'Tap "Allow" for VPN permissions, then toggle ON.',
      ],
      note: 'QR code setup takes under 30 seconds on Android.',
    },
    openvpn: {
      downloadUrl: 'https://play.google.com/store/apps/details?id=net.openvpn.openvpn',
      downloadLabel: 'Download OpenVPN Connect from Play Store',
      steps: [
        'Install OpenVPN Connect from the Play Store.',
        'Download a .ovpn file from ZeroTraceVPN.',
        'Open OpenVPN Connect → tap the + button → "Upload File".',
        'Select the .ovpn file from your downloads.',
        'Enter the shared credentials and tap "Connect".',
      ],
    },
  },
  linux: {
    wireguard: {
      downloadUrl: 'https://www.wireguard.com/install/',
      downloadLabel: 'WireGuard Installation Docs',
      steps: [
        'Install WireGuard: sudo apt install wireguard (Ubuntu/Debian)',
        'Download the .conf file from ZeroTraceVPN → Free VPN → WireGuard.',
        'Move it: sudo mv zerotrace-wg-*.conf /etc/wireguard/wg0.conf',
        'Set permissions: sudo chmod 600 /etc/wireguard/wg0.conf',
        'Connect: sudo wg-quick up wg0',
        'Auto-start on boot: sudo systemctl enable wg-quick@wg0',
      ],
      note: 'To disconnect: sudo wg-quick down wg0',
    },
    openvpn: {
      downloadUrl: 'https://openvpn.net/community-downloads/',
      downloadLabel: 'OpenVPN Installation Docs',
      steps: [
        'Install OpenVPN: sudo apt install openvpn (Ubuntu/Debian)',
        'Download the ZIP from ZeroTraceVPN and extract it.',
        'Create credentials file: echo -e "vpnbook\\nfree2024" > /tmp/creds.txt',
        'Edit the .ovpn file: change "auth-user-pass" to "auth-user-pass /tmp/creds.txt"',
        'Connect: sudo openvpn --config zerotrace-*.ovpn',
        'Press Ctrl+C to disconnect.',
      ],
      note: 'For NetworkManager GUI: sudo apt install network-manager-openvpn-gnome',
    },
  },
};

// ── Step component ────────────────────────────────────────────────────────────
const StepList = ({ steps }: { steps: string[] }) => (
  <ol className="space-y-3">
    {steps.map((step, i) => (
      <li key={i} className="flex gap-3">
        <span className="w-6 h-6 rounded-full bg-[#ff9900] text-black text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
          {i + 1}
        </span>
        <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
      </li>
    ))}
  </ol>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const Setup = () => {
  const { t } = useLanguage();
  const [os, setOs] = useState<OS>('windows');
  const [protocol, setProtocol] = useState<Protocol>('wireguard');

  const guide = GUIDES[os][protocol];

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex flex-col">
      <PublicNav />

      {/* Header */}
      <div className="bg-[#232f3e] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-[#ff9900] text-xs font-bold uppercase tracking-widest mb-2">
            <CheckCircle className="w-4 h-4" /> Setup Guide
          </div>
          <h1 className="text-3xl font-black mb-2">{t.setupGuide}</h1>
          <p className="text-white/60 text-sm">Step-by-step instructions for every platform.</p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* OS selector */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-1 flex gap-1 mb-6 overflow-x-auto">
          {OS_LIST.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setOs(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold whitespace-nowrap transition-all ${
                os === id ? 'bg-[#232f3e] text-white' : 'text-gray-500 hover:text-[#16191f]'
              }`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Protocol selector */}
        <div className="flex gap-3 mb-6">
          {(['wireguard', 'openvpn'] as Protocol[]).map(p => (
            <button key={p} onClick={() => setProtocol(p)}
              className={`px-5 py-2 rounded border text-sm font-bold transition-all ${
                protocol === p
                  ? 'bg-[#ff9900] border-[#ff9900] text-black'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#ff9900]/50'
              }`}>
              {p === 'wireguard' ? '⚡ WireGuard' : '🛡️ OpenVPN'}
            </button>
          ))}
        </div>

        {/* Guide card */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="bg-[#f2f3f3] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#16191f]">
                {protocol === 'wireguard' ? 'WireGuard' : 'OpenVPN'} on {OS_LIST.find(o => o.id === os)?.label}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {protocol === 'wireguard'
                  ? 'Fastest setup — QR code supported on mobile'
                  : 'Battle-tested — works through most firewalls'}
              </p>
            </div>
            <a href={guide.downloadUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black text-sm font-bold rounded transition-all">
              <Download className="w-4 h-4" /> {guide.downloadLabel}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Steps */}
          <div className="px-6 py-6">
            <StepList steps={guide.steps} />

            {guide.note && (
              <div className="mt-5 flex gap-2 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                {guide.note}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-gray-100 px-6 py-4 bg-[#f2f3f3] flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              Need the config files?
            </p>
            <a href="/free-vpn"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#232f3e] hover:bg-[#1a2332] text-white text-sm font-bold rounded transition-all">
              Get VPN Configs <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Setup;
