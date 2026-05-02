import { useState, useEffect } from 'react';
import { Settings, Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminGeneralTab = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'ZeroTraceVPN',
    tagline: '',
    contactEmail: '',
    supportEmail: '',
    logoUrl: '',
    announcementText: '',
    announcementOn: false,
    announcementType: 'info',
    maintenanceMode: false,
    maintenanceMsg: '',
    allowedMaintenanceIPs: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/admin/site-settings');
      setSettings({
        siteName: data.siteName || 'ZeroTraceVPN',
        tagline: data.tagline || '',
        contactEmail: data.contactEmail || '',
        supportEmail: data.supportEmail || '',
        logoUrl: data.logoUrl || '',
        announcementText: data.announcementText || '',
        announcementOn: data.announcementOn || false,
        announcementType: data.announcementType || 'info',
        maintenanceMode: data.maintenanceMode || false,
        maintenanceMsg: data.maintenanceMsg || '',
        allowedMaintenanceIPs: data.allowedMaintenanceIPs || '',
      });
    } catch (err) {
      console.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/admin/site-settings/general', settings);
      toast.success('General settings saved successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Site Information */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#16191f] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#ff9900]" />
            Site Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              placeholder="ZeroTraceVPN"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              placeholder="Your Privacy, Our Priority"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                placeholder="contact@zerotracevpn.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                placeholder="support@zerotracevpn.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Logo URL</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                placeholder="https://example.com/logo.png"
              />
              <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all flex items-center gap-2 border border-gray-300">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Banner */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#16191f]">Announcement Banner</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-600">Show Banner</span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, announcementOn: !settings.announcementOn })}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  settings.announcementOn ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.announcementOn ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </label>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Message</label>
            <textarea
              value={settings.announcementText}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
              rows={3}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              placeholder="Important announcement message..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Style</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'info', label: 'Info', color: 'blue' },
                { value: 'warning', label: 'Warning', color: 'yellow' },
                { value: 'alert', label: 'Alert', color: 'red' },
              ].map((style) => (
                <button
                  key={style.value}
                  onClick={() => setSettings({ ...settings, announcementType: style.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.announcementType === style.value
                      ? `border-${style.color}-500 bg-${style.color}-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-[#16191f] font-semibold text-sm">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-lg border border-red-200 shadow-sm">
        <div className="px-6 py-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-[#16191f]">Maintenance Mode</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-600">Enable</span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </label>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Maintenance Message</label>
            <textarea
              value={settings.maintenanceMsg}
              onChange={(e) => setSettings({ ...settings, maintenanceMsg: e.target.value })}
              rows={3}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              placeholder="We're performing scheduled maintenance. We'll be back soon!"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Allowed IPs During Maintenance (comma-separated)
            </label>
            <input
              type="text"
              value={settings.allowedMaintenanceIPs}
              onChange={(e) => setSettings({ ...settings, allowedMaintenanceIPs: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
              placeholder="192.168.1.1, 10.0.0.1"
            />
            <p className="text-xs text-gray-500 mt-1.5">These IPs can access the site during maintenance</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#ff9900] hover:bg-[#e88b00] disabled:bg-gray-300 disabled:text-gray-500 text-black font-bold rounded-lg transition-all shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save General Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminGeneralTab;
