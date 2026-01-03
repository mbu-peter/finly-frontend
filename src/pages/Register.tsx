import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Github, Chrome, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const selectedPlan = searchParams.get('plan') || 'basic';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.auth.signup({
        email,
        password,
        fullName: `${firstName} ${lastName}`,
        selectedPlan,
      });

      login(data.token, data.user);
      
      if (selectedPlan !== 'basic') {
        navigate(`/checkout?plan=${selectedPlan}`);
      } else {
        navigate('/dashboard');
      }
      toast.success('Account created successfully!');
    } catch (err: any) {
      const msg = err.message || 'An error occurred during registration';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-purple-900/20 via-[#09090b] to-[#09090b]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[480px] space-y-8"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 mb-4"
          >
            <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-2xl">F</div>
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Create your account</h2>
          <p className="text-zinc-400">Join Finly today and take control of your wealth</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[32px] backdrop-blur-xl shadow-2xl">
          <form className="space-y-5" onSubmit={handleRegister}>
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    required
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Last Name</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Rivera"
                    required
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex items-start space-x-3 p-1">
              <div className="mt-1">
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <p className="text-[12px] text-zinc-500 leading-tight">
                By signing up, you agree to our <span className="text-zinc-300">Terms of Service</span> and <span className="text-zinc-300">Privacy Policy</span>.
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 group mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#121214] px-4 text-zinc-500">Already a member?</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center space-x-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 py-3 rounded-2xl transition-all"
            >
              <Chrome size={18} className="text-red-500" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 py-3 rounded-2xl transition-all">
              <Github size={18} className="text-white" />
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-500 text-sm">
          Already have an account?{' '}
          <NavLink to="/login" className="text-purple-500 hover:text-purple-400 font-semibold underline-offset-4 hover:underline transition-all">
            Sign In
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
