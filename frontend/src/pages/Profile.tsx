import { useState, useEffect } from 'react';
import { User, Mail, Lock, Loader2, CheckCircle, Shield, Save } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const Profile = () => {
  const { user: storeUser, login, token } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Name form
  const [name, setName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    api.get('/auth/profile')
      .then(r => { setProfile(r.data); setName(r.data.name || ''); })
      .finally(() => setLoading(false));
  }, []);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMsg('');
    setNameSaving(true);
    try {
      const r = await api.put('/auth/profile', { name });
      setProfile((p: any) => ({ ...p, name: r.data.name }));
      if (storeUser && token) login({ ...storeUser, ...r.data }, token);
      setNameMsg('Name updated successfully.');
    } catch (err: any) {
      setNameMsg(err.response?.data?.error || 'Failed to update name.');
    } finally {
      setNameSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(''); setPwError('');
    if (newPassword !== confirmPassword) return setPwError('Passwords do not match.');
    if (newPassword.length < 8) return setPwError('Password must be at least 8 characters.');
    setPwSaving(true);
    try {
      await api.put('/auth/profile', { currentPassword, newPassword });
      setPwMsg('Password changed successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setPwError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin text-[#ff9900]" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#16191f]">My Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account details and security settings.</p>
      </div>

      {/* Account info card */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-[#ff9900]" />
          <span className="font-bold text-[#16191f] text-sm">Account Information</span>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 w-20 shrink-0">Email</span>
            <span className="text-[#16191f] font-medium">{profile?.email}</span>
            {profile?.emailVerified && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 w-20 shrink-0">Plan</span>
            <span className="px-2 py-0.5 bg-[#fff8ec] border border-[#ff9900]/30 rounded text-[10px] font-bold text-[#cc7a00] uppercase">
              {profile?.plan}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 w-20 shrink-0">Member since</span>
            <span className="text-[#16191f]">{new Date(profile?.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Update name */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-[#ff9900]" />
          <span className="font-bold text-[#16191f] text-sm">Display Name</span>
        </div>
        <form onSubmit={saveName} className="px-6 py-5 space-y-4">
          {nameMsg && (
            <div className={`px-3 py-2 rounded text-xs font-medium border ${nameMsg.includes('success') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {nameMsg}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                placeholder="Your display name" />
            </div>
          </div>
          <button type="submit" disabled={nameSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-sm rounded transition-all disabled:opacity-60">
            {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Name
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#ff9900]" />
          <span className="font-bold text-[#16191f] text-sm">Change Password</span>
        </div>
        <form onSubmit={savePassword} className="px-6 py-5 space-y-4">
          {pwMsg && (
            <div className="px-3 py-2 rounded text-xs font-medium border bg-green-50 border-green-200 text-green-700">{pwMsg}</div>
          )}
          {pwError && (
            <div className="px-3 py-2 rounded text-xs font-medium border bg-red-50 border-red-200 text-red-700">{pwError}</div>
          )}
          {[
            { label: 'Current Password', value: currentPassword, set: setCurrentPassword, placeholder: '••••••••' },
            { label: 'New Password', value: newPassword, set: setNewPassword, placeholder: '••••••••' },
            { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, placeholder: '••••••••' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required value={value} onChange={e => set(e.target.value)}
                  className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                  placeholder={placeholder} />
              </div>
            </div>
          ))}
          <button type="submit" disabled={pwSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-sm rounded transition-all disabled:opacity-60">
            {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
