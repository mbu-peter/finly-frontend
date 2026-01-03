import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface P2POffer {
  _id: string;
  type: 'buy' | 'sell';
  cryptocurrency: string;
  fiatCurrency: string;
  amount: number;
  price: number;
  minLimit: number;
  maxLimit: number;
  paymentMethods: string[];
  userId: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    rating?: number;
  };
  createdAt: string;
  expiresAt: string;
}

interface OfferCardProps {
  offer: P2POffer;
  onAccept: (offerId: string, amount: number, paymentMethod: string) => void;
  getCryptoIcon: (symbol: string) => string;
}

export const OfferCard = ({ offer, onAccept, getCryptoIcon }: OfferCardProps) => {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptAmount, setAcceptAmount] = useState(offer.minLimit.toString());
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(offer.paymentMethods[0]);

  const handleAccept = () => {
    const amount = parseFloat(acceptAmount);
    if (amount < offer.minLimit || amount > offer.maxLimit) {
      toast.error(`Amount must be between ${offer.minLimit} and ${offer.maxLimit} ${offer.fiatCurrency}`);
      return;
    }
    onAccept(offer._id, amount, selectedPaymentMethod);
    setShowAcceptModal(false);
  };

  const formatTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const getPaymentMethodName = (method: string) => {
    const methodNames: { [key: string]: string } = {
      bank_transfer: 'Bank Transfer',
      paypal: 'PayPal',
      cash_app: 'Cash App',
      venmo: 'Venmo',
      zelle: 'Zelle',
      revolut: 'Revolut',
      wise: 'Wise'
    };
    return methodNames[method] || method;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
              offer.type === 'buy' ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'
            }`}>
              {getCryptoIcon(offer.cryptocurrency)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  offer.type === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                }`}>
                  {offer.type.toUpperCase()}
                </span>
                <span className="text-white font-bold">
                  {offer.cryptocurrency}/{offer.fiatCurrency}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Clock size={12} />
                <span>{formatTimeLeft(offer.expiresAt)}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              ${offer.price.toLocaleString()}
            </div>
            <div className="text-sm text-zinc-400">per {offer.cryptocurrency}</div>
          </div>
        </div>

        {/* Amount & Limits */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Available:</span>
            <span className="text-white font-medium">
              {offer.amount.toLocaleString()} {offer.cryptocurrency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Limits:</span>
            <span className="text-white font-medium">
              ${offer.minLimit.toLocaleString()} - ${offer.maxLimit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {offer.paymentMethods.slice(0, 3).map(method => (
              <span
                key={method}
                className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
              >
                {getPaymentMethodName(method)}
              </span>
            ))}
            {offer.paymentMethods.length > 3 && (
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs">
                +{offer.paymentMethods.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
              <User size={16} className="text-zinc-400" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">{offer.userId.fullName}</div>
              <div className="text-zinc-400 text-xs">ID: {offer.userId._id.slice(-8)}</div>
            </div>
          </div>

          {offer.userId.rating && (
            <div className="flex items-center gap-1">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-green-500 text-sm font-medium">
                {offer.userId.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowAcceptModal(true)}
          className={`w-full py-3 rounded-xl font-bold transition-colors ${
            offer.type === 'buy'
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          {offer.type === 'buy' ? 'Sell to Buyer' : 'Buy from Seller'}
        </button>
      </motion.div>

      {/* Accept Offer Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {offer.type === 'buy' ? 'Sell to Buyer' : 'Buy from Seller'}
            </h3>

            <div className="space-y-4 mb-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Amount ({offer.fiatCurrency})
                </label>
                <input
                  type="number"
                  value={acceptAmount}
                  onChange={(e) => setAcceptAmount(e.target.value)}
                  min={offer.minLimit}
                  max={offer.maxLimit}
                  step="0.01"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-zinc-500 mt-1">
                  Limits: ${offer.minLimit} - ${offer.maxLimit}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Payment Method
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {offer.paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {getPaymentMethodName(method)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary */}
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-2">You'll {offer.type === 'buy' ? 'receive' : 'pay'}:</div>
                <div className="text-lg font-bold text-white">
                  {(parseFloat(acceptAmount || '0') / offer.price).toFixed(8)} {offer.cryptocurrency}
                </div>
                <div className="text-sm text-zinc-400">
                  ≈ ${parseFloat(acceptAmount || '0').toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
              >
                Confirm Trade
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
