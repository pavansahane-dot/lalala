import { useEffect, useState } from 'react';
import { Loader2, Save, QrCode, KeyRound, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const SETTING_GROUPS = [
  {
    label: 'Branding',
    keys: [
      { key: 'brand_name', label: 'Brand Name', placeholder: 'ZeroTraceVPN' },
      { key: 'brand_logo_url', label: 'Logo URL', placeholder: 'https://...' },
    ]
  },
  {
    label: 'SMTP / Email',
    keys: [
      { key: 'smtp_host', label: 'SMTP Host', placeholder: 'smtp.example.com' },
      { key: 'smtp_port', label: 'SMTP Port', placeholder: '587' },
      { key: 'smtp_user', label: 'SMTP User', placeholder: 'noreply@example.com' },
      { key: 'smtp_pass', label: 'SMTP Password', placeholder: '••••••••' },
    ]
  },
  {
    label: 'Network Security',
    keys: [
      { key: 'geo_block_enabled', label: 'GeoIP Blocking (true/false)', placeholder: 'false' },
      { key: 'ip_whitelist', label: 'IP Whitelist (comma-separated, leave blank to allow all)', placeholder: '1.2.3.4, 5.6.7.8' },
      { key: 'ip_blacklist', label: 'IP Blacklist (comma-separated)', placeholder: '9.9.9.9' },
    ]
  }
];

// ── 2FA Enroll Section ───────────────────────────────────────────────────────
const TwoFactorSection = () => {
  const user = useAuthStore(s => s.user);
  const [step, setStep] = useState<'idle' | 'qr' | 'verify' | 'done'>('idle');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [base32, setBase32] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already enabled, show status
  const alreadyEnabled = user?.twoFactorEnabled;

  const setup = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.post('/admin/2fa/setup');
      setOtpauthUrl(r.data.otpauthUrl);
      setBase32(r.data.base32);
      setStep('qr');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/2fa/verify', { token });
      setStep('done');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        <h2 className="text-[#16191f] font-bold text-sm">Two-Factor Authentication (TOTP)</h2>
        {(alreadyEnabled || step === 'done') && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Enabled
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>
      )}

      {step === 'idle' && (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            {alreadyEnabled
              ? 'Your account has 2FA enabled. You can re-enroll to rotate your TOTP secret.'
              : 'Protect your admin account with a time-based one-time password (TOTP) using Google Authenticator or Authy.'}
          </p>
          <button onClick={setup} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            {alreadyEnabled ? 'Re-enroll 2FA' : 'Set Up 2FA'}
          </button>
        </div>
      )}

      {step === 'qr' && (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.</p>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shrink-0">
              <QRCodeSVG value={otpauthUrl} size={180} />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Manual entry key</label>
                <code className="block bg-blue-50 rounded-lg p-3 text-blue-700 text-xs font-mono break-all border border-blue-200">{base32}</code>
              </div>
              <button onClick={() => setStep('verify')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm">
                <KeyRound className="w-4 h-4" /> I've scanned it — Enter code
              </button>
              <button onClick={() => setStep('idle')} className="text-gray-500 hover:text-gray-700 text-xs transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <form onSubmit={verify} className="space-y-4 max-w-xs">
          <p className="text-gray-600 text-sm">Enter the 6-digit code from your authenticator app.</p>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" maxLength={6} value={token}
              onChange={e => setToken(e.target.value)} required autoFocus
              className="w-full bg-white border border-gray-300 text-[#16191f] pl-9 pr-4 py-2.5 rounded-lg text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-colors"
              placeholder="000000"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded-lg text-sm transition-all shadow-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Verify & Enable
            </button>
            <button type="button" onClick={() => setStep('qr')} className="px-4 py-2 text-sm text-gray-600 hover:text-[#16191f] transition-colors">Back</button>
          </div>
        </form>
      )}

      {step === 'done' && (
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-medium">2FA successfully enabled! You'll be prompted for a code on next login.</p>
          <button onClick={() => setStep('idle')} className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Settings Page ───────────────────────────────────────────────────────
const AdminSettings = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then(r => setValues(r.data))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#16191f]">System Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Branding, SMTP, network security & 2FA</p>
      </div>

      {/* 2FA Section — always visible at top */}
      <TwoFactorSection />

      {/* System settings form */}
      <form onSubmit={save} className="space-y-5">
        {SETTING_GROUPS.map(group => (
          <div key={group.label} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-[#16191f] font-bold text-sm mb-4 pb-3 border-b border-gray-200">{group.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.keys.map(({ key, label, placeholder }) => (
                <div key={key} className={key === 'ip_whitelist' || key === 'ip_blacklist' ? 'md:col-span-2' : ''}>
                  <label className="text-xs text-gray-600 font-medium mb-1.5 block">{label}</label>
                  <input
                    value={values[key] ?? ''}
                    onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-white border border-gray-300 text-[#16191f] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-colors placeholder:text-gray-400"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50 ${saved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#ff9900] hover:bg-[#e88b00] text-black'}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
