import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Plus,
  Filter,
  TrendingUp,
  TrendingDown,
  User,
  DollarSign,
  X,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { CreateOfferModal } from '../components/p2p/CreateOfferModal';

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

interface SupportedCrypto {
  symbol: string;
  name: string;
  icon: string;
}

const P2P = () => {
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [supportedCryptos, setSupportedCryptos] = useState<SupportedCrypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<P2POffer | null>(null);
  const [acceptAmount, setAcceptAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'buy', 'sell'
    cryptocurrency: '',
    fiatCurrency: 'USD',
    paymentMethod: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOffers();
    fetchSupportedCryptos();
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [filters]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (filters.type !== 'all') params.type = filters.type;
      if (filters.cryptocurrency) params.cryptocurrency = filters.cryptocurrency;
      if (filters.fiatCurrency) params.fiatCurrency = filters.fiatCurrency;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;

      const response = await api.p2p.getOffers(params);
      setOffers(response.offers || []);
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      toast.error('Failed to load offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportedCryptos = async () => {
    try {
      const cryptos = await api.p2p.getSupportedCryptos();
      setSupportedCryptos(cryptos);
    } catch (err) {
      console.error('Error fetching supported cryptos:', err);
    }
  };

  const handleCreateOffer = () => {
    setShowCreateModal(true);
  };

  const handleOfferCreated = () => {
    setShowCreateModal(false);
    fetchOffers();
    toast.success('Offer created successfully!');
  };

  const handleAcceptOffer = (offer: P2POffer) => {
    setSelectedOffer(offer);
    setAcceptAmount(offer.minLimit.toString());
    setSelectedPaymentMethod(offer.paymentMethods[0]);
    setShowAcceptModal(true);
  };

  const confirmAcceptOffer = async () => {
    if (!selectedOffer) return;

    try {
      await api.p2p.acceptOffer(selectedOffer._id, {
        amount: parseFloat(acceptAmount),
        paymentMethod: selectedPaymentMethod
      });
      toast.success('Offer accepted! Check your trades for next steps.');
      setShowAcceptModal(false);
      setSelectedOffer(null);
      fetchOffers(); // Refresh offers
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept offer');
    }
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      cryptocurrency: '',
      fiatCurrency: 'USD',
      paymentMethod: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const getCryptoIcon = (symbol: string) => {
    const crypto = supportedCryptos.find(c => c.symbol === symbol);
    return crypto?.icon || symbol;
  };

  const getPaymentMethodName = (method: string) => {
    const methodNames: { [key: string]: string } = {
      bank_transfer: 'Bank Transfer',
      paypal: 'PayPal',
      cash_app: 'Cash App',
      venmo: 'Venmo',
      zelle: 'Zelle',
      revolut: 'Revolut',
      wise: 'Wise',
      mpesa: 'M-Pesa',
      crypto_wallet: 'Crypto Wallet'
    };
    return methodNames[method] || method;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">P2P Trading</h1>
          <p className="text-zinc-400 mt-2">Buy and sell cryptocurrency directly with other users</p>
        </div>
        <button
          onClick={handleCreateOffer}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
        >
          <Plus size={20} />
          Create Offer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Buy Offers</p>
              <p className="text-2xl font-bold text-white">
                {offers.filter(o => o.type === 'buy').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Sell Offers</p>
              <p className="text-2xl font-bold text-white">
                {offers.filter(o => o.type === 'sell').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <DollarSign className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Volume</p>
              <p className="text-2xl font-bold text-white">
                ${offers.reduce((sum, offer) => sum + (offer.amount * offer.price), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <User className="text-purple-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Active Traders</p>
              <p className="text-2xl font-bold text-white">
                {new Set(offers.map(o => o.userId._id)).size}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Filters</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {(filters.type !== 'all' || filters.cryptocurrency || filters.paymentMethod || filters.minAmount || filters.maxAmount) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            {/* Crypto Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Cryptocurrency</label>
              <select
                value={filters.cryptocurrency}
                onChange={(e) => setFilters({ ...filters, cryptocurrency: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                {supportedCryptos.map(crypto => (
                  <option key={crypto.symbol} value={crypto.symbol}>
                    {crypto.icon} {crypto.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fiat Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Fiat Currency</label>
              <select
                value={filters.fiatCurrency}
                onChange={(e) => setFilters({ ...filters, fiatCurrency: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="cash_app">Cash App</option>
                <option value="venmo">Venmo</option>
                <option value="zelle">Zelle</option>
                <option value="revolut">Revolut</option>
                <option value="wise">Wise</option>
              </select>
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Min Amount</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Max Amount</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                placeholder="10000"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Offers List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            Available Offers {offers.length > 0 && `(${offers.length})`}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : offers.length > 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Trader</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Crypto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Available</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Limits</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {offers.map((offer) => (
                    <tr key={offer._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                            <User size={16} className="text-zinc-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">{offer.userId.fullName}</div>
                            <div className="text-zinc-400 text-xs">ID: {offer.userId._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                          offer.type === 'buy'
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-red-600/20 text-red-400'
                        }`}>
                          {offer.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCryptoIcon(offer.cryptocurrency)}</span>
                          <div>
                            <div className="text-white font-medium">{offer.cryptocurrency}</div>
                            <div className="text-zinc-400 text-xs">{offer.fiatCurrency}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-bold">${offer.price.toLocaleString()}</div>
                        <div className="text-zinc-400 text-xs">per {offer.cryptocurrency}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{offer.amount.toLocaleString()}</div>
                        <div className="text-zinc-400 text-xs">{offer.cryptocurrency}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-400 text-sm">
                          ${offer.minLimit} - ${offer.maxLimit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {offer.paymentMethods.slice(0, 2).map(method => (
                            <span
                              key={method}
                              className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs"
                            >
                              {getPaymentMethodName(method)}
                            </span>
                          ))}
                          {offer.paymentMethods.length > 2 && (
                            <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs">
                              +{offer.paymentMethods.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleAcceptOffer(offer)}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                            offer.type === 'buy'
                              ? 'bg-green-600 hover:bg-green-500 text-white'
                              : 'bg-red-600 hover:bg-red-500 text-white'
                          }`}
                        >
                          {offer.type === 'buy' ? 'Sell' : 'Buy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="text-zinc-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No offers found</h3>
            <p className="text-zinc-400 mb-6">Try adjusting your filters or create your own offer</p>
            <button
              onClick={handleCreateOffer}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
            >
              Create First Offer
            </button>
          </div>
        )}
      </div>

        {/* Create Offer Modal */}
        {showCreateModal && (
          <CreateOfferModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleOfferCreated}
            supportedCryptos={supportedCryptos}
          />
        )}

        {/* Accept Offer Modal */}
        {showAcceptModal && selectedOffer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {selectedOffer.type === 'buy' ? 'Sell to Buyer' : 'Buy from Seller'}
              </h3>

              <div className="space-y-4 mb-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Amount ({selectedOffer.fiatCurrency})
                  </label>
                  <input
                    type="number"
                    value={acceptAmount}
                    onChange={(e) => setAcceptAmount(e.target.value)}
                    min={selectedOffer.minLimit}
                    max={selectedOffer.maxLimit}
                    step="0.01"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-xs text-zinc-500 mt-1">
                    Limits: ${selectedOffer.minLimit} - ${selectedOffer.maxLimit}
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
                    {selectedOffer.paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {getPaymentMethodName(method)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Summary */}
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="text-sm text-zinc-400 mb-2">You'll {selectedOffer.type === 'buy' ? 'receive' : 'pay'}:</div>
                  <div className="text-lg font-bold text-white">
                    {(parseFloat(acceptAmount || '0') / selectedOffer.price).toFixed(8)} {selectedOffer.cryptocurrency}
                  </div>
                  <div className="text-sm text-zinc-400">
                    ≈ ${parseFloat(acceptAmount || '0').toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setSelectedOffer(null);
                  }}
                  className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAcceptOffer}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
                >
                  Confirm Trade
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </div>
  );
};

export default P2P;
