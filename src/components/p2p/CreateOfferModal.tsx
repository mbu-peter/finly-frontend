import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface SupportedCrypto {
  symbol: string;
  name: string;
  icon: string;
}

interface CreateOfferModalProps {
  onClose: () => void;
  onSuccess: () => void;
  supportedCryptos: SupportedCrypto[];
}

export const CreateOfferModal = ({ onClose, onSuccess, supportedCryptos }: CreateOfferModalProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    type: 'sell',
    cryptocurrency: 'BTC',
    fiatCurrency: 'USD',
    amount: '',
    price: '',
    minLimit: '',
    maxLimit: '',
    paymentMethods: [] as string[],
    terms: '',
    expiresInHours: '24'
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const methods = await api.p2p.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.amount || !formData.price || !formData.minLimit || !formData.maxLimit) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.maxLimit) < parseFloat(formData.minLimit)) {
      toast.error('Maximum limit must be greater than minimum limit');
      return;
    }

    if (formData.paymentMethods.length === 0) {
      toast.error('Please select at least one payment method');
      return;
    }

    try {
      setLoading(true);

      await api.p2p.createOffer({
        ...formData,
        amount: parseFloat(formData.amount),
        price: parseFloat(formData.price),
        minLimit: parseFloat(formData.minLimit),
        maxLimit: parseFloat(formData.maxLimit),
        expiresInHours: parseInt(formData.expiresInHours)
      });

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-white">Create P2P Offer</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              I want to
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="sell"
                  checked={formData.type === 'sell'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'buy' | 'sell' })}
                  className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 focus:ring-blue-500"
                />
                <span className="text-white font-medium">Sell Cryptocurrency</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="buy"
                  checked={formData.type === 'buy'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'buy' | 'sell' })}
                  className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 focus:ring-blue-500"
                />
                <span className="text-white font-medium">Buy Cryptocurrency</span>
              </label>
            </div>
          </div>

          {/* Cryptocurrency & Fiat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Cryptocurrency
              </label>
              <select
                value={formData.cryptocurrency}
                onChange={(e) => setFormData({ ...formData, cryptocurrency: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {supportedCryptos.map(crypto => (
                  <option key={crypto.symbol} value={crypto.symbol}>
                    {crypto.icon} {crypto.name} ({crypto.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Fiat Currency
              </label>
              <select
                value={formData.fiatCurrency}
                onChange={(e) => setFormData({ ...formData, fiatCurrency: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>

          {/* Amount & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Amount ({formData.cryptocurrency})
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Price per {formData.cryptocurrency} ({formData.fiatCurrency})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Minimum Trade Amount ({formData.fiatCurrency})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.minLimit}
                onChange={(e) => setFormData({ ...formData, minLimit: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Maximum Trade Amount ({formData.fiatCurrency})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.maxLimit}
                onChange={(e) => setFormData({ ...formData, maxLimit: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1000.00"
                required
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Accepted Payment Methods
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(method => (
                <label
                  key={method.id}
                  className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes(method.id)}
                    onChange={() => togglePaymentMethod(method.id)}
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <div className="text-white font-medium text-sm">{method.name}</div>
                    <div className="text-zinc-400 text-xs">{method.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Terms & Conditions (Optional)
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Add any specific terms or conditions for this offer..."
            />
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Offer Expires In
            </label>
            <select
              value={formData.expiresInHours}
              onChange={(e) => setFormData({ ...formData, expiresInHours: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </select>
          </div>

          {/* Summary */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">Offer Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Type:</span>
                <span className="text-white capitalize">{formData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Pair:</span>
                <span className="text-white">{formData.cryptocurrency}/{formData.fiatCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Value:</span>
                <span className="text-white">
                  ${(parseFloat(formData.amount || '0') * parseFloat(formData.price || '0')).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Limits:</span>
                <span className="text-white">
                  ${formData.minLimit || '0'} - ${formData.maxLimit || '0'}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              'Create Offer'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
