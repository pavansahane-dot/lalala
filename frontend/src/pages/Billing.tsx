import { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Shield, Loader2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

interface SubStatus { plan: string; status: string; expiresAt: string | null; }

const Billing = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const paymentResult = searchParams.get('payment');

  useEffect(() => {
    api.get('/billing/status')
      .then(r => setSub(r.data))
      .catch(() => setSub({ plan: 'free', status: 'none', expiresAt: null }))
      .finally(() => setSubLoading(false));
  }, []);

  const handleUpgrade = async (tier: string) => {
    setIsProcessing(tier);
    try {
      const r = await api.post('/billing/create-checkout-session', { planTier: tier });
      window.location.href = r.data.url;
    } catch {
      alert('Failed to initiate checkout. Please try again.');
      setIsProcessing(null);
    }
  };

  const handlePortal = async () => {
    setIsProcessing('portal');
    try {
      const r = await api.post('/billing/portal');
      window.location.href = r.data.url;
    } catch {
      alert('Failed to open billing portal.');
      setIsProcessing(null);
    }
  };

  const currentPlan = sub?.plan ?? 'free';
  const isActive = sub?.status === 'active';

  return (
    <div className="max-w-5xl space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#16191f]">Subscription Plans</h1>
        <p className="text-gray-500 text-sm mt-1">Choose the plan that fits your needs. Upgrade or downgrade at any time.</p>
      </div>

      {/* Payment result banners */}
      {paymentResult === 'success' && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded p-4 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Payment successful! Your plan has been upgraded.
        </div>
      )}
      {paymentResult === 'cancelled' && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-700 text-sm">
          <XCircle className="w-4 h-4 shrink-0" />
          Checkout cancelled. No charges were made.
        </div>
      )}

      {/* Current subscription status */}
      {!subLoading && isActive && (
        <div className="bg-white border border-gray-200 rounded shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Current Subscription</div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-[#fff8ec] border border-[#ff9900]/30 rounded text-xs font-black text-[#cc7a00] uppercase">{currentPlan}</span>
              <span className="text-xs text-gray-500">
                {sub?.expiresAt ? `Renews ${new Date(sub.expiresAt).toLocaleDateString()}` : 'Active'}
              </span>
            </div>
          </div>
          <button onClick={handlePortal} disabled={isProcessing === 'portal'}
            className="flex items-center gap-2 px-4 py-2 bg-[#16191f] hover:bg-[#2d3748] text-white text-xs font-bold rounded transition-all disabled:opacity-60">
            {isProcessing === 'portal' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
            Manage Subscription
          </button>
        </div>
      )}

      {/* Pricing grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Basic */}
        <div className="bg-white border border-gray-200 rounded shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Basic</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#16191f]">$0</span>
              <span className="text-gray-400 text-sm">/mo</span>
            </div>
          </div>
          <ul className="px-6 py-5 space-y-3 flex-1">
            {['1 Device limit', '3 Server locations', 'Standard speed'].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                <Check className="w-4 h-4 text-gray-400 shrink-0" />{f}
              </li>
            ))}
          </ul>
          <div className="px-6 pb-6">
            <button disabled className="w-full py-2.5 bg-gray-100 border border-gray-200 text-gray-400 rounded text-sm font-bold cursor-not-allowed">
              {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>
        </div>

        {/* Pro */}
        <div className="bg-white border-2 border-[#ff9900] rounded shadow-md flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 bg-[#ff9900] text-black text-xs font-black px-3 py-1 rounded-full shadow">
              <Zap className="w-3 h-3" /> Most Popular
            </span>
          </div>
          <div className="px-6 py-5 border-b border-[#ff9900]/20 bg-[#fff8ec]">
            <div className="text-xs font-bold text-[#cc7a00] uppercase tracking-widest mb-2">Pro</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#16191f]">$9.99</span>
              <span className="text-gray-400 text-sm">/mo</span>
            </div>
          </div>
          <ul className="px-6 py-5 space-y-3 flex-1">
            {['5 Device limit', 'All 50+ Server locations', 'Maximum bandwidth', 'Ad & Malware blocking'].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-[#16191f] font-medium">
                <Check className="w-4 h-4 text-[#ff9900] shrink-0" />{f}
              </li>
            ))}
          </ul>
          <div className="px-6 pb-6">
            {currentPlan === 'pro' && isActive ? (
              <button disabled className="w-full py-2.5 bg-green-100 border border-green-300 text-green-700 rounded text-sm font-bold cursor-not-allowed">
                ✓ Current Plan
              </button>
            ) : (
              <button onClick={() => handleUpgrade('pro')} disabled={isProcessing !== null}
                className="w-full py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black rounded text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60">
                {isProcessing === 'pro' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Enterprise */}
        <div className="bg-white border border-gray-200 rounded shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Enterprise</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#16191f]">$29.99</span>
              <span className="text-gray-400 text-sm">/mo</span>
            </div>
          </div>
          <ul className="px-6 py-5 space-y-3 flex-1">
            {['Unlimited Devices', 'Dedicated IP Addresses', 'Dedicated Account Manager', '24/7 Priority Support'].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                <Check className="w-4 h-4 text-gray-500 shrink-0" />{f}
              </li>
            ))}
          </ul>
          <div className="px-6 pb-6">
            {currentPlan === 'enterprise' && isActive ? (
              <button disabled className="w-full py-2.5 bg-green-100 border border-green-300 text-green-700 rounded text-sm font-bold cursor-not-allowed">
                ✓ Current Plan
              </button>
            ) : (
              <button onClick={() => handleUpgrade('enterprise')} disabled={isProcessing !== null}
                className="w-full py-2.5 bg-[#16191f] hover:bg-[#2d3748] text-white rounded text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {isProcessing === 'enterprise' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Go Enterprise
              </button>
            )}
          </div>
        </div>

      </div>


    </div>
  );
};

export default Billing;
