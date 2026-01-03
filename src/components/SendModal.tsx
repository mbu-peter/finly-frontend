import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: Array<{ amount: string; symbol: string; assetId: string; network: string; networkName: string }>;
  onSuccess: () => void;
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, balances, onSuccess }) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(balances[0]?.network || 'base-sepolia');
  const [selectedAsset, setSelectedAsset] = useState('eth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentBalance = balances.find(b => b.network === selectedNetwork)?.amount || '0';
  // const currentNetworkName = balances.find(b => b.network === selectedNetwork)?.networkName || 'Unknown';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) > parseFloat(currentBalance)) {
      setError('Insufficient balance on selected network');
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.post('/wallets/send', {
        address,
        amount,
        assetId: selectedAsset,
        network: selectedNetwork
      });
      console.log('Send response:', data);

      toast.success('Transaction sent successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Send error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-zinc-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
                  <Send size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Send Assets</h2>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Digital Asset Transfer</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-zinc-50 rounded-2xl transition-colors text-zinc-400 hover:text-zinc-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-6">
              {/* Network & Asset Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-2 ml-1">
                    Network
                  </label>
                  <select 
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all appearance-none cursor-pointer"
                  >
                    {balances.map(b => (
                      <option key={b.network} value={b.network}>{b.networkName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-2 ml-1">
                    Asset
                  </label>
                  <select 
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all appearance-none cursor-pointer"
                  >
                    <option value="eth">ETH</option>
                  </select>
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-2 ml-1">
                  Recipient Address
                </label>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x... or Address"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400">
                    Amount to Send
                  </label>
                  <span className="text-[10px] font-bold text-zinc-500">
                    Avail: {currentBalance} {selectedAsset.toUpperCase()}
                  </span>
                </div>
                <div className="relative">
                  <input 
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-5 pr-16 py-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">
                    {selectedAsset.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold"
                  >
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-zinc-900 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-zinc-200"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Confirm Transfer
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-relaxed max-w-[280px] mx-auto opacity-50">
              Transactions on the blockchain are irreversible. Please double check the recipient address.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SendModal;
