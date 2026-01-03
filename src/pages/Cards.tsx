import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { 
  Plus, 
  Shield, 
  Zap, 
  Settings, 
  Lock, 
  Eye, 
  EyeOff, 
  Snowflake, 
  CreditCard,
  History,
  ArrowUpRight,
  Loader2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const VirtualCards = () => {
  const { profile } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  
  const planTier = profile?.planTier || 'basic';

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [virtualCard, setVirtualCard] = useState<any>(null);

  // Fetch Virtual Card
  useEffect(() => {
    if (profile?.issuingCardId) {
      setVirtualCard({
        id: profile.issuingCardId,
        card_number: `•••• •••• •••• ${profile.cardNumber || '••••'}`,
        cardholder_name: profile.fullName,
        expiry_date: `${profile.cardExpiryMonth}/${profile.cardExpiryYear?.toString().slice(-2)}`,
        cvc: '•••', // CVC is not stored for security, would need Stripe's ephemeral keys to show
        brand: profile.cardBrand?.toLowerCase(),
        status: profile.cardStatus || 'active'
      });
      setIsFrozen(profile.cardStatus === 'inactive');
    }
  }, [profile]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!profile) return;
      
      try {
        const data = await api.get('/transactions');
        if (data) setTransactions(data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, [profile]);

  const handleVerifyIdentity = async () => {
    setVerifying(true);
    try {
      const { clientSecret, status } = await api.post('/stripe/create-identity-verification-session', {});
      
      if (status === 'verified') {
        toast.success('Identity already verified!');
        window.location.reload();
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.verifyIdentity(clientSecret);

      if (error) {
        console.error(error);
        toast.error('Verification failed or cancelled');
      } else {
        toast.success('Verification submitted! Checking status...');
        // Poll for status or reload
        await api.get('/stripe/check-identity-verification');
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to start verification');
    } finally {
      setVerifying(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!profile) return;
    const newStatus = isFrozen ? 'active' : 'inactive';
    
    setLoading(true);
    try {
      await api.put('/profile', { cardStatus: newStatus });
      setIsFrozen(!isFrozen);
      setVirtualCard({ ...virtualCard, status: newStatus });
      toast.success(`Card ${isFrozen ? 'unfrozen' : 'frozen'} successfully`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update card status');
    } finally {
      setLoading(false);
    }
  };

  if (planTier === 'basic') {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 p-12">
        <div className="w-32 h-32 bg-blue-600/10 rounded-[40px] flex items-center justify-center text-blue-500 mb-4">
          <CreditCard size={64} />
        </div>
        <div className="space-y-4 max-w-lg">
          <h2 className="text-4xl font-black tracking-tight">Virtual Cards are Premium</h2>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Upgrade your account to Standard or Premium to issue and manage unlimited virtual cards with military-grade security.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <NavLink 
            to="/checkout?plan=standard" 
            className="px-10 py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all shadow-xl"
          >
            Upgrade Now
          </NavLink>
        </div>
      </div>
    );
  }

  // --- IDENTITY VERIFICATION GATE ---
  if (!profile?.identityVerified) {
    return (
       <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 p-12">
        <div className="w-32 h-32 bg-amber-600/10 rounded-[40px] flex items-center justify-center text-amber-500 mb-4">
          <Shield size={64} />
        </div>
        <div className="space-y-4 max-w-lg">
          <h2 className="text-4xl font-black tracking-tight">Identity Verification Required</h2>
          <div className="flex flex-col gap-2 items-center text-zinc-400">
             <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500"/>
                <span>Government Issued ID</span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500"/>
                <span>Selfie Verification</span>
             </div>
          </div>
          <p className="text-zinc-500 text-lg leading-relaxed">
            To issue your virtual card and comply with financial regulations, we need to verify your identity. This process takes less than 2 minutes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleVerifyIdentity}
            disabled={verifying}
            className="px-10 py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all shadow-xl flex items-center gap-2"
          >
            {verifying ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
            {verifying ? 'Verifying...' : 'Verify Identity'}
          </button>
        </div>
        <p className="text-xs text-zinc-600 max-w-xs">
          Powered by Stripe Identity. Your data is encrypted and securely stored.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Virtual Cards</h2>
          <p className="text-zinc-500 px-1">Manage your digital spending and card security</p>
        </div>
        <Button className="bg-white text-black hover:bg-zinc-200 rounded-2xl px-6 py-6 font-bold flex items-center shadow-xl">
          <Plus size={20} className="mr-2" />
          Create New Card
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Card Visualization Section */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative group perspective-1000">
            <motion.div
              layout
              animate={{ 
                rotateY: isFrozen ? 5 : 0,
                scale: isFrozen ? 0.98 : 1,
              }}
              className={`
                aspect-[1.586/1] w-full rounded-[32px] p-10 relative overflow-hidden shadow-2xl transition-all duration-700
                ${isFrozen 
                  ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700/50 grayscale' 
                  : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-indigo-500/20'}
              `}
            >
              {/* Card Texture/Overlay */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
              
              {/* Frozen Overlay */}
              <AnimatePresence>
                {isFrozen && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px]"
                  >
                    <div className="flex flex-col items-center space-y-2">
                        <Snowflake size={48} className="text-blue-400 animate-pulse" />
                        <span className="text-xl font-black uppercase tracking-[0.3em] text-white">Frozen</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative h-full flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Premium Credit</p>
                    <h3 className="text-2xl font-black italic">Finly</h3>
                  </div>
                  <div className="w-16 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <div className="flex -space-x-3">
                        <div className="w-6 h-6 rounded-full bg-rose-500/80"></div>
                        <div className="w-6 h-6 rounded-full bg-amber-500/80"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex space-x-4 items-center">
                    <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-inner"></div>
                    <div className="text-xl md:text-3xl font-mono tracking-[0.2em] font-bold">
                        {showDetails ? (virtualCard?.card_number || '•••• •••• •••• ••••') : '•••• •••• •••• ' + (virtualCard?.card_number?.slice(-4) || '••••')}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Card Holder</p>
                        <p className="font-bold tracking-tight uppercase">{virtualCard?.cardholder_name || profile?.fullName || 'VALUED MEMBER'}</p>
                    </div>
                    <div className="flex space-x-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Expires</p>
                            <p className="font-bold tracking-tight">{virtualCard?.expiry_date || 'MM/YY'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">CVC</p>
                            <p className="font-bold tracking-tight">{showDetails ? (virtualCard?.cvc || '•••') : '•••'}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all mb-3">
                {showDetails ? <EyeOff size={24} /> : <Eye size={24} />}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">{showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
            <button 
              onClick={handleToggleFreeze}
              disabled={loading}
              className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <div className={`p-3 rounded-2xl transition-all mb-3 ${isFrozen ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-blue-600/10 group-hover:text-blue-500'}`}>
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Snowflake size={24} />}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">{isFrozen ? 'Unfreeze' : 'Freeze'}</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all mb-3">
                <Lock size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Change PIN</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all mb-3">
                <Settings size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Limits</span>
            </button>
          </div>
        </div>

        {/* Card Info & Transactions */}
        <div className="lg:col-span-5 space-y-8">
            <Card className="p-8 border-zinc-800 bg-zinc-900/50">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Shield size={20} className="mr-3 text-emerald-500" />
                    Security Overview
                </h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Contactless Payments</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Enabled</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                            <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Online Transactions</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Enabled</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                            <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-8 border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center">
                        <History size={20} className="mr-3 text-blue-500" />
                        Recent Transactions
                    </h3>
                    <button className="text-xs text-blue-500 font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-6">
                    {transactions.length === 0 ? (
                        <p className="text-zinc-500 text-sm text-center py-4">No recent transactions</p>
                    ) : transactions.map((t, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-800 group-hover:bg-zinc-700 transition-colors flex items-center justify-center font-bold text-zinc-500 uppercase">
                                    {(t.description || 'Unknown')[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold group-hover:text-blue-500 transition-colors">{t.description || 'Unknown'}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider capitalize">{t.type?.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black ${t.type !== 'deposit' ? 'text-white' : 'text-emerald-500'}`}>
                                    {t.type !== 'deposit' ? '-' : '+'}${Math.abs(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase">
                                    {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center">
                    Get Receipt Explorer
                    <ArrowUpRight size={14} className="ml-2" />
                </button>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualCards;
