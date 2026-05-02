import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Mail className="w-6 h-6 text-[#ff9900]" />
            </div>
            <h1 className="text-white font-bold text-lg">Reset Password</h1>
            <p className="text-white/50 text-xs mt-1">ZeroTraceVPN Console</p>
          </div>

          <div className="bg-white border border-gray-200 border-t-0 rounded-b shadow-md px-8 py-6">
            {sent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <p className="text-sm text-gray-700 font-medium">Check your inbox</p>
                <p className="text-xs text-gray-500">If an account exists for <strong>{email}</strong>, a reset link has been sent. It expires in 1 hour.</p>
                <Link to="/login" className="block text-xs text-[#0073bb] hover:text-[#005a8e] font-semibold transition-colors mt-2">
                  ← Back to sign in
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 px-3 py-2.5 rounded text-xs font-medium border bg-red-50 border-red-200 text-red-700">{error}</div>
                )}
                <p className="text-xs text-gray-500 mb-4">Enter your account email and we'll send you a reset link.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full border border-gray-300 text-[#16191f] text-sm pl-9 pr-3 py-2.5 rounded focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]/30 transition-all"
                        placeholder="you@example.com" />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full py-2.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold text-sm rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
                <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                  <Link to="/login" className="text-xs text-[#0073bb] hover:text-[#005a8e] font-semibold transition-colors">
                    ← Back to sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
