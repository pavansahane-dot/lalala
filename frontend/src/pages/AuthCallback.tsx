import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  useEffect(() => {
    const token   = params.get('token');
    const refresh = params.get('refresh');
    const error   = params.get('error');

    if (error || !token) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    const user = {
      id:    params.get('id') || '',
      email: params.get('email') || '',
      name:  params.get('name') || '',
      plan:  params.get('plan') || 'free',
      role:  params.get('role') || 'user',
    };

    login(user, token, refresh || undefined);
    navigate('/dashboard', { replace: true });
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Shield className="w-8 h-8 text-[#ff9900] animate-pulse" />
        <p className="text-sm text-gray-500 font-medium">Signing you in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
