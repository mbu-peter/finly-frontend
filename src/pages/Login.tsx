import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Chrome, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Handle redirect from Google Auth with token
    const token = searchParams.get('token');
    if (token) {
      const handleGoogleLogin = async () => {
        login(token, {} as any);
        // Navigation will happen via the user effect above
      };
      handleGoogleLogin();
    }
  }, [searchParams, login]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.auth.login({
        email,
        password,
      });

      if (data.requires2FA) {
        // 2FA required
        console.log('2FA required, tempToken:', data.tempToken);
        setRequires2FA(true);
        setTempToken(data.tempToken);
        setLoading(false);
        return;
      }

      // Set token and user state
      login(data.token, data.user);

      // Navigation will happen via the user effect above
      // Don't set loading to false here - let the redirect happen
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || 'An error occurred during login';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.post('/auth/verify-2fa', {
        tempToken,
        token: twoFactorToken,
        backupCode: backupCode || undefined,
      });

      // Set token and user state
      login(data.token, data.user);

      // Navigation will happen via the user effect above
    } catch (err: any) {
      const msg = err.message || 'Invalid 2FA code';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#09090b] to-[#09090b]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[440px] space-y-8"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-4"
          >
            <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-2xl">F</div>
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-zinc-400">Enter your credentials to access your account</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[32px] backdrop-blur-xl shadow-2xl">
          {!requires2FA ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
                <p className="text-zinc-400">Enter your credentials to access your account</p>
              </div>
              <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-zinc-400">Password</label>
                <NavLink to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</NavLink>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
                </button>
              </form>

              <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121214] px-4 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center space-x-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 py-3 rounded-2xl transition-all"
            >
              <Chrome size={20} className="text-red-500" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 py-3 rounded-2xl transition-all">
              <Github size={20} className="text-white" />
              <span className="text-sm font-medium">GitHub</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">Two-Factor Authentication</h2>
              <p className="text-zinc-400">Enter your authentication code</p>
            </div>
            <form className="space-y-6" onSubmit={handleVerify2FA}>
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">6-digit Code</label>
                <input
                  type="text"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 px-4 text-white placeholder:text-zinc-600 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  maxLength={6}
                />
                <p className="text-xs text-zinc-500 text-center">Enter the code from your authenticator app</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Backup Code (optional)</label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  placeholder="Enter backup code"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <p className="text-xs text-zinc-500 text-center">Use this if you can't access your authenticator</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Verify & Sign In</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTempToken('');
                  setTwoFactorToken('');
                  setBackupCode('');
                  setError(null);
                }}
                className="w-full text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
              >
                ← Back to login
              </button>
            </form>
          </>
        )}
      </div>

        <p className="text-center text-zinc-500 text-sm">
          Don't have an account?{' '}
          <NavLink to="/register" className="text-blue-500 hover:text-blue-400 font-semibold underline-offset-4 hover:underline transition-all">
            Create an account
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
