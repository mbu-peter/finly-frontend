import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { 
  Search, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  Star,
  X,
  Loader2,
  DollarSign
} from 'lucide-react';
import { fetchCryptoPrices, CryptoPrice } from '../lib/crypto';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface TradeModalProps {
  asset: CryptoPrice | null;
  isOpen: boolean;
  onClose: () => void;
  type: 'buy' | 'sell';
}

const TradeModal = ({ asset, isOpen, onClose, type }: TradeModalProps) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !asset) return null;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Simulate trade delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      await api.post('/transactions', {
        type: type === 'buy' ? 'crypto_buy' : 'crypto_sell',
        amount: parseFloat(amount),
        currency: 'USD',
        description: `${type === 'buy' ? 'Bought' : 'Sold'} ${asset.name}`,
        assetId: asset.id,
        assetSymbol: asset.symbol
      });
      
      toast.success(`Successfully ${type === 'buy' ? 'bought' : 'sold'} $${amount} of ${asset.symbol}`);
      onClose();
    } catch (err: any) {
      console.error('Trade Error details:', err);
      toast.error(err.message || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
        
        <div className="flex items-center space-x-4 mb-6">
          <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded-xl" />
          <div>
            <h3 className="text-xl font-bold">{type === 'buy' ? 'Buy' : 'Sell'} {asset.name}</h3>
            <p className="text-sm text-zinc-500">Current Price: ${asset.current_price.toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={handleTrade} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Amount (USD)</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-xl space-y-2">
             <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Estimated {asset.symbol}</span>
                <span className="font-mono font-bold">{(parseFloat(amount || '0') / asset.current_price).toFixed(6)}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Network Fee</span>
                <span className="font-mono font-bold">$2.50</span>
             </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center transition-all ${type === 'buy' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : `Confirm ${type === 'buy' ? 'Purchase' : 'Sale'}`}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const CryptoMarketplace = () => {
  const [assets, setAssets] = useState<CryptoPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<CryptoPrice | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Poll API every 30s
  useEffect(() => {
    const fetchPrices = async () => {
      const data = await fetchCryptoPrices();
      if (data.length > 0) setAssets(data);
      setLoadingPrices(false);
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate "Live" Ticks between API calls
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setAssets(current => 
        current.map(asset => {
          // Micro-movement: ±0.1% max variation per tick to look "alive"
          const volatility = 0.001; 
          const change = 1 + (Math.random() * volatility * 2 - volatility);
          return {
            ...asset,
            current_price: asset.current_price * change
          };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(tickInterval);
  }, []);

  const openTrade = (asset: CryptoPrice, type: 'buy' | 'sell') => {
    setSelectedAsset(asset);
    setTradeType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
            <Zap size={14} />
            <span>Market Hub</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight">Crypto Marketplace</h2>
          <p className="text-zinc-500 max-w-xl">Trade, swap, and track over 250+ digital assets with the deepest liquidity and lowest fees in the industry.</p>
        </div>
        
        <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl">
          <button className="px-6 py-2.5 bg-zinc-800 text-white rounded-xl text-sm font-bold shadow-lg">Spot</button>
          <button className="px-6 py-2.5 text-zinc-500 hover:text-white rounded-xl text-sm font-bold transition-all">Futures</button>
          <button className="px-6 py-2.5 text-zinc-500 hover:text-white rounded-xl text-sm font-bold transition-all">Staking</button>
        </div>
      </div>

      {/* Market Stats & Search */}
      <div className="flex flex-col lg:flex-row justify-between gap-8 py-2">
        <div className="flex flex-wrap gap-4">
            <div className="px-6 py-4 rounded-[24px] bg-zinc-900 border border-zinc-800 flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Market Cap</p>
                    <p className="text-lg font-bold"> $2.48 Trillion <span className="text-emerald-500 text-xs ml-1">+1.4%</span></p>
                </div>
            </div>
            <div className="px-6 py-4 rounded-[24px] bg-zinc-900 border border-zinc-800 flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <Activity size={20} />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">24h Volume</p>
                    <p className="text-lg font-bold"> $84.2 Billion <span className="text-blue-500 text-xs ml-1">+4.2%</span></p>
                </div>
            </div>
        </div>

        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[24px] py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Asset Table */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500">
                <th className="px-8 py-6">Asset</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Change (24h)</th>
                <th className="px-8 py-6 text-right">Chart</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              <AnimatePresence mode="popLayout">
                {loadingPrices ? (
                   <tr className="border-b border-zinc-800">
                      <td colSpan={5} className="p-12 text-center text-zinc-500">
                         <div className="flex justify-center mb-4"><Loader2 className="animate-spin" size={24} /></div>
                         Loading market data...
                      </td>
                   </tr>
                ) : assets.map((asset) => (
                  <motion.tr 
                    layout
                    key={asset.id} 
                    className="hover:bg-zinc-800/30 transition-all cursor-pointer group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <button className="text-zinc-700 hover:text-yellow-500 transition-colors">
                            <Star size={16} />
                        </button>
                        <img src={asset.image} alt={asset.name} className="w-10 h-10 rounded-xl" />
                        <div>
                          <p className="font-bold group-hover:text-blue-500 transition-colors text-sm">{asset.name}</p>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{asset.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-mono font-bold text-sm">
                        ${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${asset.price_change_percentage_24h > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {asset.price_change_percentage_24h > 0 ? <ArrowUp size={10} className="mr-1" /> : <ArrowDown size={10} className="mr-1" />}
                        {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end space-x-1 h-8">
                         {[30, 40, 35, 50, 45, 60, 55, 70].map((h, idx) => (
                             <div 
                                key={idx} 
                                className={`w-1 rounded-full ${asset.price_change_percentage_24h > 0 ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`} 
                                style={{ height: `${h}%` }}
                             ></div>
                         ))}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openTrade(asset, 'sell')}
                          className="p-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all text-xs font-bold uppercase"
                        >
                          Sell
                        </button>
                        <button 
                          onClick={() => openTrade(asset, 'buy')}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isModalOpen && selectedAsset && (
            <TradeModal 
                asset={selectedAsset} 
                isOpen={isModalOpen} 
                type={tradeType}
                onClose={() => setIsModalOpen(false)} 
            />
        )}
      </AnimatePresence>

      {/* Newsletter / CTA */}
      <section className="relative p-12 rounded-[48px] bg-gradient-to-br from-blue-600 to-purple-800 overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
                <h3 className="text-3xl font-black tracking-tight">Ready to start trading?</h3>
                <p className="text-blue-100/80 max-w-md">Deposit funds instantly via your virtual Finly card and start building your portfolio today.</p>
            </div>
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-xl p-2 rounded-[28px] border border-white/20">
                <input type="email" placeholder="Enter your email" className="bg-transparent border-none px-6 py-4 text-white placeholder:text-blue-100/50 focus:ring-0 w-64" />
                <button className="bg-white text-blue-600 px-8 py-4 rounded-[22px] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl">Join Now</button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default CryptoMarketplace;
