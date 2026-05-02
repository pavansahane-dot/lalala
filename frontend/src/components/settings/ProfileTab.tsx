import { useState, useEffect } from 'react';
import { User, Mail, Globe, Clock, Upload, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Japan', 'Brazil', 'Mexico',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Russia', 'China', 'South Korea'
].sort();

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland'
];

const ProfileTab = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    country: '',
    timezone: 'UTC',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/user/settings');
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        username: data.username || '',
        country: data.country || '',
        timezone: data.timezone || 'UTC',
      });
    } catch (err) {
      console.error('Failed to load profile');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    const name = formData.name || user?.email || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/user/settings/profile', formData);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#16191f]">Profile Information</h2>
        <p className="text-gray-600 text-sm mt-1">Update your personal details and preferences</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff9900] to-[#e88b00] flex items-center justify-center text-[#16191f] text-2xl font-bold">
                {getInitials()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-[#ff9900] hover:bg-[#e88b00] p-2 rounded-full cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-[#16191f]" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <h3 className="text-[#16191f] font-semibold">{formData.name || 'User'}</h3>
            <p className="text-gray-600 text-sm">{formData.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                user?.plan === 'pro' ? 'bg-gradient-to-r from-[#ff9900] to-[#e88b00] text-[#16191f]' : 'bg-gray-200 text-gray-700'
              }`}>
                {user?.plan?.toUpperCase() || 'FREE'}
              </span>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
            placeholder="john@example.com"
          />
          <p className="text-xs text-yellow-600 mt-1">⚠️ A verification email will be sent if you change this</p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Username (Optional)
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
            placeholder="johndoe"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
          >
            <option value="">Select a country</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
          >
            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>

        {/* Member Since */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Member Since</p>
          <p className="text-[#16191f] font-semibold mt-1">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            }) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#ff9900] hover:bg-[#e88b00] disabled:bg-gray-400 text-[#16191f] font-semibold rounded-lg transition-all shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
