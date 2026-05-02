import { useState, useEffect } from 'react';
import { Smartphone, Download, Trash2, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const DevicesTab = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxDevices, setMaxDevices] = useState(3);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const { data } = await api.get('/vpn/devices');
      setDevices(data.devices || []);
      setMaxDevices(data.maxDevices || 3);
    } catch (err) {
      console.error('Failed to load devices');
    }
  };

  const revokeDevice = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this device? The config will stop working.')) return;
    
    setLoading(true);
    try {
      await api.delete(`/vpn/devices/${id}`);
      toast.success('Device revoked successfully');
      loadDevices();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to revoke device');
    } finally {
      setLoading(false);
    }
  };

  const downloadConfig = async (id: string) => {
    try {
      const { data } = await api.get(`/vpn/devices/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `config-${id}.conf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Config downloaded');
    } catch (err: any) {
      toast.error('Failed to download config');
    }
  };

  const usagePercent = (devices.length / maxDevices) * 100;

  return (
    <div className="space-y-6">
      {/* Usage Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[#16191f] font-semibold">Device Usage</h3>
          <span className="text-gray-600 text-sm">{devices.length} / {maxDevices} devices</span>
        </div>
        <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              usagePercent >= 100 ? 'bg-red-500' : usagePercent >= 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        {devices.length >= maxDevices && (
          <p className="text-yellow-400 text-sm mt-3">
            ⚠️ Device limit reached. <button onClick={() => navigate('/billing')} className="underline font-semibold">Upgrade to Pro</button> for unlimited devices.
          </p>
        )}
      </div>

      {/* Devices List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            My Devices
          </h2>
          <button
            onClick={() => navigate('/dashboard/configs')}
            disabled={devices.length >= maxDevices}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Device
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Device Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Protocol</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Server</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Config</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600">No devices yet</p>
                    <button
                      onClick={() => navigate('/dashboard/configs')}
                      className="mt-4 text-blue-400 hover:text-blue-300 font-semibold text-sm"
                    >
                      Add your first device →
                    </button>
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-[#16191f] font-semibold">{device.deviceName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        device.protocol === 'wireguard'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {device.protocol === 'wireguard' ? 'WireGuard' : 'OpenVPN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{device.serverName || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(device.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => downloadConfig(device.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-[#16191f] rounded-lg transition-all text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => revokeDevice(device.id)}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DevicesTab;
