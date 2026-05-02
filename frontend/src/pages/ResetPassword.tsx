import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Lock, Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
];

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const allRulesPassed = passwordRules.every(r => r.test(password));
  const passwordsMatch = password === confirm && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPassed) return setError('Password does not meet the requirements.');
    if (!passwordsMatch) return setError('Passwords do not match.');
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      navigate('/login?verified=1');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f2f3f3] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-600 font-medium text-sm">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-xs text-[#0073bb] hover:text-[#005a8e]">Request a new one</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex flex-col">
      <header className="bg-[#232f3e] border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#ff9900]" />
          <span className="text-white font-black tracking-tight text-sm">
            ZeroTrace<span className="text-[#ff9900]">VPN</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-[#232f3e] rounded-t px-8 py-5 text-center">
            <div className="w-12 h-12 bg-[#ff9900]/10 border border-[#ff9900]/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-[#ff9900]" />
            </div>
            <h1 className="text-white font-bold text-lg">New Password</h1>
            <p className="text-white/50 text-xs mt-1">ZeroTraceVPN Console</p>
          </div>

          <div className="bg-white border border-gray-200 border-t-0 rounded-b shadow-md px-8 py-6">
            {error && (
              <div className="mb-4 px-3 py-2.5 rounded text-xs font-medium border bg-red-50 border-red-200 text-red-700">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                    placeholder="••••••••" />
                </div>
                {password.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordRules.map(rule => {
                      const passed = rule.test(password);
                      return (
                        <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                          {passed ? <CheckCircle className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    className={`w-full border text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:ring-1 transition-all ${
                      confirm.length > 0
                        ? passwordsMatch
                          ? 'border-green-400 focus:border-green-500 focus:ring-green-200'
                          : 'border-red-300 focus:border-red-400 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#ff9900] focus:ring-[#ff9900]/30'
                    }`}
                    placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-sm rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
