import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, Smartphone, Loader2, Check, X, Download, QrCode, AlertCircle, Monitor, MapPin } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

const SecurityTab = () => {
  return (
    <div className="space-y-6">
      <ChangePasswordSection />
      <TwoFactorSection />
      <ActiveSessionsSection />
      <LoginHistorySection />
    </div>
  );
};

// Change Password Section
const ChangePasswordSection = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (score === 3) return { label: 'Strong', color: 'bg-[#ff9900]', width: '75%' };
    return { label: 'Very Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getStrength(passwords.new);

  const handleUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/user/settings/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" />
          Change Password
        </h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-12 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#16191f]"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-12 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#16191f]"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {passwords.new && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password Strength</span>
                <span className={`text-xs font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-12 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#16191f]"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {passwords.confirm && passwords.new !== passwords.confirm && (
            <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
          )}
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading || !passwords.current || !passwords.new || passwords.new !== passwords.confirm}
          className="flex items-center gap-2 px-6 py-3 bg-[#ff9900] hover:bg-[#e88b00] disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
          Update Password
        </button>
      </div>
    </div>
  );
};

// Two-Factor Authentication Section
const TwoFactorSection = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/user/settings');
      setEnabled(data.twoFactorEnabled || false);
    } catch (err) {
      console.error('Failed to check 2FA status');
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/user/settings/2fa/enable');
      setSecret(data.secret);
      const qr = await QRCode.toDataURL(data.otpauthUrl);
      setQrCode(qr);
      setShowModal(true);
      setStep(1);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/user/settings/2fa/verify', { token: verifyCode });
      setBackupCodes(data.backupCodes);
      setStep(2);
      setEnabled(true);
      toast.success('2FA enabled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    const code = prompt('Enter your 2FA code to disable:');
    if (!code) return;

    setLoading(true);
    try {
      await api.post('/user/settings/2fa/disable', { token: code });
      setEnabled(false);
      toast.success('2FA disabled');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    a.click();
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-[#16191f]">Two-Factor Authentication</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              enabled ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {enabled ? '🟢 Enabled' : '🔴 Disabled'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            Add an extra layer of security to your account by requiring a code from your authenticator app.
          </p>

          {!enabled ? (
            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              Enable 2FA
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleDisable}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                Disable 2FA
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all">
                <Download className="w-5 h-5" />
                View Backup Codes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-200 max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#16191f]">Enable Two-Factor Authentication</h3>
            </div>

            <div className="p-6">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-full" />
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Or enter this code manually:</p>
                    <code className="text-[#16191f] font-mono text-sm break-all">{secret}</code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan the QR code with Google Authenticator, Authy, or any TOTP app.
                  </p>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] text-center text-2xl tracking-widest focus:outline-none focus:border-[#ff9900]"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleVerify}
                      disabled={loading || verifyCode.length !== 6}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      Verify & Enable
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-semibold text-sm">Save Your Backup Codes</p>
                        <p className="text-yellow-400/80 text-xs mt-1">
                          Store these codes in a safe place. You can use them to access your account if you lose your device.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, i) => (
                        <code key={i} className="text-[#16191f] font-mono text-sm">{code}</code>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadBackupCodes}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#ff9900] hover:bg-[#e88b00] text-[#16191f] font-semibold rounded-lg transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download Codes
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-[#16191f] font-semibold rounded-lg transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Active Sessions Section
const ActiveSessionsSection = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data } = await api.get('/user/sessions');
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions');
    }
  };

  const revokeSession = async (id: string) => {
    setLoading(true);
    try {
      await api.delete(`/user/sessions/${id}`);
      toast.success('Session revoked');
      loadSessions();
    } catch (err: any) {
      toast.error('Failed to revoke session');
    } finally {
      setLoading(false);
    }
  };

  const revokeAll = async () => {
    if (!confirm('Revoke all other sessions? You will remain logged in on this device.')) return;
    setLoading(true);
    try {
      await api.delete('/user/sessions/all');
      toast.success('All other sessions revoked');
      loadSessions();
    } catch (err: any) {
      toast.error('Failed to revoke sessions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-400" />
            Active Sessions
          </h2>
          {sessions.length > 1 && (
            <button
              onClick={revokeAll}
              disabled={loading}
              className="text-sm text-red-400 hover:text-red-300 font-semibold"
            >
              Revoke All Others
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[#16191f] font-semibold">{session.deviceName}</p>
                  <p className="text-gray-600 text-sm">{session.browser} on {session.os}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {session.ipAddress} • Last active: {new Date(session.lastActiveAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => revokeSession(session.id)}
                disabled={loading}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-all text-sm"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Login History Section
const LoginHistorySection = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/user/activity-log?type=login');
      setHistory(data.slice(0, 20));
    } catch (err) {
      console.error('Failed to load login history');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-400" />
          Login History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Browser</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {history.map((entry) => (
              <tr key={entry.id} className="hover:bg-white/50">
                <td className="px-6 py-4 text-sm text-[#16191f]">{new Date(entry.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{entry.ipAddress}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{entry.metadata?.browser || 'Unknown'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{entry.metadata?.location || 'Unknown'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    entry.action.includes('SUCCESS') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {entry.action.includes('SUCCESS') ? 'Success' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityTab;
