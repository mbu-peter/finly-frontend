import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { NavLink } from 'react-router-dom';
import { api } from '../lib/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send reset link';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-bold tracking-tight text-white">Reset Password</h2>
          <p className="text-zinc-400">We'll send you a link to your email to reset your account</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[32px] backdrop-blur-xl shadow-2xl">
          {!submitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={32} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Check your email</h3>
                <p className="text-zinc-400 text-sm">We've sent a password reset link to <span className="text-white font-medium">{email}</span></p>
              </div>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-sm text-blue-500 hover:text-blue-400 font-semibold"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}
        </div>

        <p className="text-center">
          <NavLink to="/login" className="inline-flex items-center text-zinc-500 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to login
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
