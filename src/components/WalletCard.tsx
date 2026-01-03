import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, QrCode, ExternalLink, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface WalletCardProps {
  address: string;
  network: string;
  balances: Array<{
    amount: string;
    symbol: string;
  }>;
}

const WalletCard: React.FC<WalletCardProps> = ({ address, network, balances }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400">Main Wallet</h3>
              <p className="font-bold text-zinc-900 capitalize">{network.replace('-', ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a 
              href={`https://sepolia.basescan.org/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 hover:bg-zinc-50 rounded-2xl transition-colors text-zinc-400 hover:text-blue-600"
              title="View on Explorer"
            >
              <ExternalLink size={20} />
            </a>
            <button 
              onClick={() => setShowQR(!showQR)}
              className="p-3 hover:bg-zinc-50 rounded-2xl transition-colors text-zinc-400 hover:text-blue-600"
            >
              <QrCode size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {balances.map((balance, index) => (
            <div key={index} className="flex items-end gap-2">
              <span className="text-4xl font-black text-zinc-900 tracking-tight">
                {parseFloat(balance.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </span>
              <span className="text-xl font-black text-blue-600 mb-1">{balance.symbol}</span>
            </div>
          ))}
          {balances.length === 0 && (
            <div className="text-4xl font-black text-zinc-200 tracking-tight">0.00</div>
          )}
        </div>

        <div className="bg-zinc-50 rounded-2xl p-4 flex items-center justify-between border border-zinc-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Your Address</span>
            <span className="font-mono text-sm text-zinc-600 truncate max-w-[180px]">
              {address}
            </span>
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95 text-zinc-400 hover:text-blue-600"
          >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {showQR && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex flex-col items-center gap-4 bg-zinc-50 rounded-3xl p-6 border border-zinc-100"
            >
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <QRCodeSVG value={address} size={160} />
              </div>
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-relaxed px-4">
                Only send assets on the <span className="text-blue-600">{network.replace('-', ' ')}</span> network to this address.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WalletCard;
