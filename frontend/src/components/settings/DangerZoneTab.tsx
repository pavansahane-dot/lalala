import { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DangerZoneTab = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    try {
      await api.delete('/user/account');
      logout();
      navigate('/?deleted=1');
      toast.success('Account deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border-2 border-red-500/50">
        <div className="p-6 border-b border-red-500/30 bg-red-500/5">
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
        </div>

        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#16191f] font-bold text-lg mb-2">Delete Account</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Permanently delete your account and all associated data including:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 mb-6 ml-4">
                  <li>• All VPN configurations and devices</li>
                  <li>• Bandwidth usage logs and statistics</li>
                  <li>• Profile information and settings</li>
                  <li>• Subscription and billing history</li>
                  <li>• All active sessions</li>
                </ul>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-semibold text-sm">Warning</p>
                      <p className="text-yellow-400/80 text-sm mt-1">
                        This action cannot be undone. All your VPN configs will immediately stop working.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-[#16191f] font-semibold rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-red-500/50 max-w-md w-full">
            <div className="p-6 border-b border-red-500/30 bg-red-500/5">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Confirm Account Deletion
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-semibold text-sm mb-2">
                  ⚠️ This action is permanent and cannot be undone!
                </p>
                <p className="text-red-400/80 text-sm">
                  All your data will be permanently deleted and your VPN configurations will stop working immediately.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Type <code className="bg-red-500/20 px-2 py-1 rounded text-red-400">DELETE</code> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={loading || confirmText !== 'DELETE'}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Permanently Delete
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setConfirmText('');
                  }}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-[#16191f] font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DangerZoneTab;
