import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TwoFactorVerifyProps {
  tempToken: string;
  onBack: () => void;
}

const TwoFactorVerify = ({ tempToken, onBack }: TwoFactorVerifyProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const verifyToken = async () => {
    const codeToVerify = useBackupCode ? backupCode.trim() : token.trim();

    if (!codeToVerify) {
      toast.error(`Please enter your ${useBackupCode ? 'backup code' : '2FA token'}`);
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-2fa', {
        tempToken,
        [useBackupCode ? 'backupCode' : 'token']: codeToVerify
      });

      // Login successful
      login(response.token, response.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    // Only allow numbers for TOTP, any characters for backup codes
    const cleaned = useBackupCode ? value : value.replace(/\D/g, '');
    if (useBackupCode) {
      setBackupCode(cleaned);
    } else {
      setToken(cleaned.slice(0, 6));
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Shield size={32} className="text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
              <p className="text-zinc-400">
                Enter your 6-digit code from your authenticator app
              </p>
            </div>

            <div className="space-y-4">
              {!useBackupCode ? (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    2FA Code
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Backup Code
                  </label>
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter backup code"
                  />
                </div>
              )}

              <button
                onClick={() => setUseBackupCode(!useBackupCode)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={verifyToken}
                disabled={(useBackupCode ? backupCode.length === 0 : token.length !== 6) || loading}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                onClick={onBack}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoFactorVerify;
