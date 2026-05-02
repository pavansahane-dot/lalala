import { useState, useEffect } from 'react';
import { CreditCard, Download, Tag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const BillingTab = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const { data } = await api.get('/billing/info');
      setSubscription(data.subscription);
      setInvoices(data.invoices || []);
      setPaymentMethod(data.paymentMethod);
    } catch (err) {
      console.error('Failed to load billing data');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      await api.post('/billing/apply-coupon', { code: couponCode });
      toast.success('Coupon applied successfully');
      setCouponCode('');
      loadBillingData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features.')) return;

    setLoading(true);
    try {
      await api.post('/billing/cancel');
      toast.success('Subscription cancelled');
      loadBillingData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const { data } = await api.get(`/billing/invoice/${invoiceId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (err: any) {
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-400" />
            Current Plan
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-4 py-2 rounded-lg text-lg font-bold ${
                  user?.plan === 'pro'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-[#16191f]'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {user?.plan?.toUpperCase() || 'FREE'} PLAN
                </span>
              </div>
              {subscription?.expiresAt && (
                <p className="text-gray-600 text-sm">
                  {subscription.status === 'active' ? 'Renews' : 'Expires'} on{' '}
                  {new Date(subscription.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {user?.plan === 'free' ? (
                <button
                  onClick={() => navigate('/billing')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-[#16191f] font-semibold rounded-lg transition-all"
                >
                  Upgrade to Pro
                </button>
              ) : (
                <button
                  onClick={cancelSubscription}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-all"
                >
                  {loading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>

          {user?.plan === 'pro' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-[#16191f] font-semibold mb-3">Pro Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Unlimited devices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Unlimited bandwidth
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Priority support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Access to all servers
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method */}
      {paymentMethod && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#16191f]">Payment Method</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[#16191f] font-semibold">
                    {paymentMethod.brand?.toUpperCase()} •••• {paymentMethod.last4}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all text-sm">
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Coupon */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f] flex items-center gap-2">
            <Tag className="w-5 h-5 text-yellow-400" />
            Apply Coupon Code
          </h2>
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-[#16191f] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
            />
            <button
              onClick={applyCoupon}
              disabled={loading || !couponCode.trim()}
              className="px-6 py-3 bg-[#ff9900] hover:bg-[#e88b00] disabled:bg-gray-600 text-[#16191f] font-semibold rounded-lg transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#16191f]">Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                    No invoices yet
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-[#16191f]">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#16191f] font-semibold">
                      ${(invoice.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        invoice.status === 'paid'
                          ? 'bg-green-500/20 text-green-400'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => downloadInvoice(invoice.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-[#16191f] rounded-lg transition-all text-sm"
                      >
                        <Download className="w-4 h-4" />
                        PDF
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

export default BillingTab;
