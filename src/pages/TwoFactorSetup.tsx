import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

const TwoFactorSetup = () => {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>('generate');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateSecret();
  }, []);

  const generateSecret = async () => {
    try {
      setLoading(true);
      const response = await api.post('/2fa/generate', {});
      setQrCode(response.qrCode);
      setSecret(response.secret);
    } catch (err: any) {
      toast.error('Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    if (!token.trim()) {
      toast.error('Please enter your 2FA token');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/2fa/enable', {
        secret,
        token: token.trim()
      });
      setBackupCodes(response.backupCodes);
      setStep('backup');
      toast.success('2FA enabled successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify token');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finly-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  if (step === 'generate') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-24">
        <header className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-xs"
          >
            <Shield size={14} />
            <span>Security</span>
          </motion.div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              Enable Two-Factor Authentication
            </h1>
            <p className="text-zinc-500 text-lg mt-2">
              Add an extra layer of security to your account
            </p>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8"
        >
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Shield size={32} className="text-white" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Step 1: Scan QR Code</h3>
              <p className="text-zinc-400">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>

            {loading ? (
              <div className="w-48 h-48 bg-zinc-800 rounded-lg mx-auto flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 mx-auto rounded-lg"
                />

                <div className="bg-zinc-800 rounded-lg p-4 text-left">
                  <p className="text-sm text-zinc-400 mb-2">Manual entry code:</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-zinc-900 px-3 py-2 rounded text-sm font-mono text-white">
                      {secret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(secret)}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              onClick={() => setStep('verify')}
              disabled={!qrCode}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all"
            >
              Next: Verify Setup
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-24">
        <header className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-xs"
          >
            <Shield size={14} />
            <span>Security</span>
          </motion.div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              Verify 2FA Setup
            </h1>
            <p className="text-zinc-500 text-lg mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Enter Verification Code</h3>
              <p className="text-zinc-400">
                Open your authenticator app and enter the 6-digit code
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                2FA Code
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('generate')}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={verifyToken}
                disabled={token.length !== 6 || loading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-24">
        <header className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 text-green-500 font-black uppercase tracking-widest text-xs"
          >
            <Shield size={14} />
            <span>Success</span>
          </motion.div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              2FA Enabled Successfully!
            </h1>
            <p className="text-zinc-500 text-lg mt-2">
              Save your backup codes in a secure location
            </p>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Backup Codes</h3>
              <p className="text-zinc-400">
                Save these codes in a secure location. You can use them to access your account if you lose your device.
              </p>
            </div>

            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-400 font-medium mb-1">Important Security Notice</h4>
                  <p className="text-red-300 text-sm">
                    Each backup code can only be used once. Store them securely and don't share them with anyone.
                    If you lose both your device and backup codes, you may lose access to your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-zinc-800 rounded-lg p-3 text-center">
                  <code className="text-white font-mono text-sm">{code}</code>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={downloadBackupCodes}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                Download Codes
              </button>
              <button
                onClick={() => window.location.href = '/settings'}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default TwoFactorSetup;
