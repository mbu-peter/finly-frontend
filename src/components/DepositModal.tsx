import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Copy, Check, QrCode, CreditCard, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Record<string, string>;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, addresses }) => {
  const [copied, setCopied] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState('base-sepolia');
  const navigate = useNavigate();

  const address = addresses[activeNetwork] || '0x...';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 2000);
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
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <Download size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Fund Account</h2>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Receive Digital Assets</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-zinc-50 rounded-2xl transition-colors text-zinc-400 hover:text-zinc-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Network Selector Tabs */}
              <div className="flex bg-zinc-50 p-1 rounded-2xl border border-zinc-100">
                <button 
                  onClick={() => setActiveNetwork('base-sepolia')}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeNetwork === 'base-sepolia' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Base Sepolia
                </button>
                <button 
                  onClick={() => setActiveNetwork('eth-sepolia')}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeNetwork === 'eth-sepolia' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Eth Sepolia
                </button>
              </div>

              {/* Card Deposit Option */}
              <button 
                onClick={() => navigate('/checkout?plan=standard')}
                className="w-full flex items-center justify-between p-5 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 rounded-3xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-zinc-900 text-sm">Buy with Card</h3>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Instant Deposit</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative py-2 flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-zinc-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">or deposit crypto</span>
                <div className="flex-1 h-[1px] bg-zinc-100" />
              </div>

              {/* Crypto Deposit QR */}
              <div className="flex flex-col items-center gap-6">
                <div className="bg-zinc-50 p-6 rounded-[40px] border border-zinc-100">
                  <QRCodeSVG value={address} size={200} />
                </div>

                <div className="w-full bg-zinc-50 rounded-2xl p-4 flex items-center justify-between border border-zinc-100">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Your {activeNetwork.replace('-', ' ')} Address</span>
                    <span className="font-mono text-xs text-zinc-600 truncate pr-4">
                      {address}
                    </span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-3 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95 text-zinc-400 hover:text-blue-600 shrink-0"
                  >
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="flex items-start gap-3 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100/50">
                  <QrCode size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-wider">
                    Only send assets on the <span className="text-blue-600">{activeNetwork.replace('-', ' ')}</span> network. Sending assets on other networks may result in permanent loss.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepositModal;
