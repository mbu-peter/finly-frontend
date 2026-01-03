import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowLeftRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import SendModal from '../components/SendModal';
import DepositModal from '../components/DepositModal';

interface CryptoPrice {
  name: string;
  symbol: string;
  current_price: number;
  previous_price?: number;
  price_change_percentage_24h: number;
  image: string;
  price_trend?: 'up' | 'down' | 'stable';
}

const Dashboard = () => {
  const { profile } = useAuth();

  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const [portfolioStats, setPortfolioStats] = useState({
    total: 0,
    cryptoValue: 0
  });

  // Swap
  const [swapFrom, setSwapFrom] = useState('usd');
  const [swapTo, setSwapTo] = useState('bitcoin');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapping, setSwapping] = useState(false);

  const fetchWallet = async () => {
    try {
      const data = await api.get('/wallets');
      setWalletData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updatePrices = async () => {
    try {
      const newPrices = await api.get('/market/prices');

      // Update prices with trend tracking
      setCryptoPrices(prevPrices => {
        const updatedPrices = newPrices.map((newPrice: any) => {
          const prevPrice = prevPrices.find(p => p.symbol === newPrice.symbol);
          const previousPrice = prevPrice?.current_price;

          let priceTrend: 'up' | 'down' | 'stable' = 'stable';
          if (previousPrice) {
            if (newPrice.current_price > previousPrice) {
              priceTrend = 'up';
            } else if (newPrice.current_price < previousPrice) {
              priceTrend = 'down';
            }
          }

          return {
            ...newPrice,
            previous_price: previousPrice,
            price_trend: priceTrend
          };
        });

        return updatedPrices;
      });

      setLoadingPrices(false);

      if (profile?.portfolio) {
        let cryptoTotal = 0;
        Object.entries(profile.portfolio).forEach(([symbol, amount]) => {
          const price = newPrices.find(
            (p: any) => p.symbol.toLowerCase() === symbol.toLowerCase()
          );
          if (price) cryptoTotal += Number(amount) * price.current_price;
        });

        setPortfolioStats({
          total: profile.fiatBalance || 0,
          cryptoValue: cryptoTotal
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWallet();
    updatePrices();
    const i = setInterval(updatePrices, 1000); // Update every 1 second
    return () => clearInterval(i);
  }, [profile]);

  const handleSwap = async () => {
    if (!swapAmount) return toast.error('Enter amount');
    setSwapping(true);
    try {
      await api.post('/market/swap', {
        userId: profile?.id,
        fromAsset: swapFrom,
        toAsset: swapTo,
        amount: swapAmount
      });
      toast.success('Swap successful');
      window.location.reload();
    } catch {
      toast.error('Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  const totalBalance =
    portfolioStats.total + portfolioStats.cryptoValue;

  const firstName = profile?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24">

      {/* ===== BINANCE STYLE HEADER ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8"
        >
          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">
            Total Balance
          </span>

          <div className="flex items-end gap-4 mt-2">
            <span className="text-4xl font-black text-white">
              ${totalBalance.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-emerald-500 mb-1">
              +14.2%
            </span>
          </div>

          <p className="text-sm text-zinc-500 mt-3">
            Welcome back, {firstName}
          </p>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setIsDepositModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black"
            >
              Deposit
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsSendModalOpen(true)}
            >
              Withdraw
            </Button>

            <Button variant="ghost">
              Transfer
            </Button>
          </div>
        </motion.div>

        {/* Fiat / Crypto Breakdown */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Assets
          </h3>

          <div className="flex justify-between">
            <span className="text-zinc-400">Fiat</span>
            <span className="font-bold">
              ${portfolioStats.total.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Crypto</span>
            <span className="font-bold">
              ${portfolioStats.cryptoValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ===== P2P CALCULATOR ===== */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          P2P Calculator
        </h3>
        <p className="text-zinc-400 text-sm mb-4">
          Calculate potential profits from P2P trading
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calculator Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Cryptocurrency
              </label>
              <select
                value={swapFrom}
                onChange={(e) => setSwapFrom(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
              >
                {cryptoPrices.slice(0, 10).map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.symbol.toUpperCase()} - ${c.current_price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Amount to Trade
              </label>
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Expected Price ($)
              </label>
              <input
                type="number"
                value={swapTo}
                onChange={(e) => setSwapTo(e.target.value)}
                placeholder="Enter expected price"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
              />
            </div>
          </div>

          {/* Calculator Results */}
          <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-white">Trade Summary</h4>

            {swapAmount && swapTo ? (
              <>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Crypto Amount:</span>
                  <span className="text-white font-medium">
                    {swapAmount} {swapFrom.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Expected Value:</span>
                  <span className="text-white font-medium">
                    ${(parseFloat(swapAmount) * parseFloat(swapTo)).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Current Market Price:</span>
                  <span className="text-white font-medium">
                    ${cryptoPrices.find(c => c.symbol === swapFrom)?.current_price.toFixed(2) || 'N/A'}
                  </span>
                </div>

                <div className="border-t border-zinc-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Potential Profit:</span>
                    <span className={`font-bold ${
                      (parseFloat(swapAmount) * parseFloat(swapTo)) >
                      (parseFloat(swapAmount) * (cryptoPrices.find(c => c.symbol === swapFrom)?.current_price || 0))
                        ? 'text-green-500' : 'text-red-500'
                    }`}>
                      ${Math.abs(
                        (parseFloat(swapAmount) * parseFloat(swapTo)) -
                        (parseFloat(swapAmount) * (cryptoPrices.find(c => c.symbol === swapFrom)?.current_price || 0))
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowLeftRight className="text-zinc-400" size={24} />
                </div>
                <p className="text-zinc-500 text-sm">Enter amount and expected price to calculate</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== P2P TRADING ===== */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            P2P Trading
          </h3>
          <NavLink to="/p2p" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View All
          </NavLink>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="text-blue-400" size={32} />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Trade Directly with Users</h4>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
            Buy and sell cryptocurrency directly with other users using your preferred payment methods.
          </p>
          <NavLink
            to="/p2p"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
          >
            Start Trading
            <ArrowRight size={16} />
          </NavLink>
        </div>
      </div>

      {/* ===== MARKET TABLE (UNCHANGED) ===== */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500">
            Market
          </h3>
          <NavLink to="/crypto" className="text-xs text-yellow-400">
            View All
          </NavLink>
        </div>

        {loadingPrices ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <tbody>
              {cryptoPrices.map((coin) => (
                <tr key={coin.symbol} className="border-b border-zinc-800">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={coin.image} className="w-7 h-7" />
                    <div>
                      <p className="font-bold">{coin.name}</p>
                      <p className="text-xs text-zinc-500">
                        {coin.symbol.toUpperCase()}
                      </p>
                    </div>
                  </td>

                  <td className={`px-6 font-bold transition-colors duration-300 ${
                    coin.price_trend === 'up' ? 'text-emerald-500' :
                    coin.price_trend === 'down' ? 'text-rose-500' : 'text-white'
                  }`}>
                    ${coin.current_price.toLocaleString()}
                  </td>

                  <td
                    className={`px-6 font-bold transition-colors duration-300 ${
                      coin.price_change_percentage_24h > 0
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </td>

                  <td className="px-6 text-right">
                    <Button
                      size="sm"
                      onClick={() => setSwapTo(coin.symbol)}
                    >
                      Trade
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== MODALS ===== */}
      {walletData && (
        <>
          <SendModal
            isOpen={isSendModalOpen}
            onClose={() => setIsSendModalOpen(false)}
            balances={walletData.balances}
            onSuccess={fetchWallet}
          />

          <DepositModal
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
            addresses={walletData.addresses}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
