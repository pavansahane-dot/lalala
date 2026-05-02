import { useState, useEffect } from 'react';
import { Bell, Mail, Loader2, Check } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const NotificationsTab = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    notifyPasswordChange: true,
    notifyNewConfig: true,
    notifyDeviceRevoked: true,
    notifyExpiry: true,
    notifyUsageReport: false,
    notifyNewServers: false,
    notifyNewDevice: true,
    notifyNewsletter: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/user/settings');
      setSettings({
        emailNotifications: data.emailNotifications ?? true,
        notifyPasswordChange: data.notifyPasswordChange ?? true,
        notifyNewConfig: data.notifyNewConfig ?? true,
        notifyDeviceRevoked: data.notifyDeviceRevoked ?? true,
        notifyExpiry: data.notifyExpiry ?? true,
        notifyUsageReport: data.notifyUsageReport ?? false,
        notifyNewServers: data.notifyNewServers ?? false,
        notifyNewDevice: data.notifyNewDevice ?? true,
        notifyNewsletter: data.notifyNewsletter ?? false,
      });
    } catch (err) {
      console.error('Failed to load notification settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/user/settings/notifications', settings);
      toast.success('Notification preferences saved');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const notifications = [
    { key: 'notifyPasswordChange', icon: '🔒', label: 'Password Changed', desc: 'Alert when your password is changed' },
    { key: 'notifyNewConfig', icon: '📱', label: 'New Config Generated', desc: 'When a new VPN config is created' },
    { key: 'notifyDeviceRevoked', icon: '🚫', label: 'Device Revoked', desc: 'When one of your devices is removed' },
    { key: 'notifyExpiry', icon: '⏰', label: 'Subscription Expiring Soon', desc: '7 days before your plan expires' },
    { key: 'notifyUsageReport', icon: '📊', label: 'Monthly Usage Report', desc: 'Summary of your bandwidth usage' },
    { key: 'notifyNewServers', icon: '🆕', label: 'New Servers Added', desc: 'When we add new VPN server locations' },
    { key: 'notifyNewDevice', icon: '⚠️', label: 'Login from New Device', desc: 'Security alert for unknown logins' },
    { key: 'notifyNewsletter', icon: '📰', label: 'Newsletter & Updates', desc: 'Product news and VPN tips' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Notification Preferences
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Master Toggle */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[#16191f] font-semibold">Email Notifications</p>
                <p className="text-gray-600 text-sm">Master switch for all email notifications</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('emailNotifications')}
              className={`relative w-14 h-7 rounded-full transition-all ${
                settings.emailNotifications ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.emailNotifications ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </button>
          </label>
        </div>

        {/* Individual Notifications */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <label
              key={notif.key}
              className={`flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all ${
                !settings.emailNotifications ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{notif.icon}</span>
                <div>
                  <p className="text-[#16191f] font-semibold">{notif.label}</p>
                  <p className="text-gray-600 text-sm">{notif.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting(notif.key as keyof typeof settings)}
                disabled={!settings.emailNotifications}
                className={`relative w-14 h-7 rounded-full transition-all ${
                  settings[notif.key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings[notif.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-0'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="p-6 border-t border-gray-200 flex justify-end">
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

export default NotificationsTab;
