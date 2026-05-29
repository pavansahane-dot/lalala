import { useState, useEffect } from 'react';
import { Lock, Download, Eye, Cookie, Loader2, Check } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const PrivacyTab = () => {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    allowAnalytics: true,
    analyticsCookies: false,
  });

  useEffect(() => {
    loadSettings();
    loadActivityLog();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/user/settings');
      setSettings({
        allowAnalytics: data.allowAnalytics ?? true,
        analyticsCookies: data.analyticsCookies ?? false,
      });
    } catch (err) {
      console.error('Failed to load privacy settings');
    }
  };

  const loadActivityLog = async () => {
    try {
      const { data } = await api.get('/user/activity-log?limit=10');
      setActivityLog(data);
    } catch (err) {
      console.error('Failed to load activity log');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/user/settings/privacy', settings);
      toast.success('Privacy preferences saved');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data } = await api.get('/user/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-data-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Data exported successfully');
    } catch (err: any) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Usage */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Data Usage
          </h2>
        </div>
        <div className="p-6">
          <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
            <div>
              <p className="text-[#16191f] font-semibold">Allow Anonymous Analytics</p>
              <p className="text-gray-600 text-sm mt-1">
                Helps us improve server performance. No personal data collected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, allowAnalytics: !settings.allowAnalytics })}
              className={`relative w-14 h-7 rounded-full transition-all ${
                settings.allowAnalytics ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.allowAnalytics ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </button>
          </label>
        </div>
      </div>

      {/* Download My Data */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            Download My Data
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">
            Export all your data including profile, devices, bandwidth logs, and settings in JSON format.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff9900] hover:bg-[#e88b00] disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export My Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Account Activity Log — admin only */}
      {isAdmin && (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-400" />
            Account Activity Log
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {activityLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                    No activity recorded yet
                  </td>
                </tr>
              ) : (
                activityLog.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-[#16191f]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.ipAddress || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.metadata ? JSON.parse(log.metadata).description || '-' : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Cookie Preferences */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Cookie className="w-5 h-5 text-orange-400" />
            Cookie Preferences
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#16191f] font-semibold">Functional Cookies</p>
                <p className="text-gray-600 text-sm mt-1">Required for the site to function properly</p>
              </div>
              <span className="px-3 py-1 bg-gray-700 text-gray-600 rounded-full text-xs font-bold">
                Always On
              </span>
            </div>
          </div>

          <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
            <div>
              <p className="text-[#16191f] font-semibold">Analytics Cookies</p>
              <p className="text-gray-600 text-sm mt-1">Help us understand how you use our service</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, analyticsCookies: !settings.analyticsCookies })}
              className={`relative w-14 h-7 rounded-full transition-all ${
                settings.analyticsCookies ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.analyticsCookies ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </button>
          </label>
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

export default PrivacyTab;
