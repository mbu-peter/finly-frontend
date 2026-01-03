import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const Checkout = () => {
  const { user, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const plan = searchParams.get('plan') || 'standard';
  const prices = { standard: '$12.00', premium: '$29.00' };
  const price = prices[plan as keyof typeof prices] || '$12.00';

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    // 1. Create a payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setPaymentError(error.message || 'An error occurred with your card.');
      setIsProcessing(false);
      return;
    }

    // 2. Call backend to create the charge
    try {
      const data = await api.post('/stripe/create-charge', {
        plan,
        paymentMethodId: paymentMethod.id,
        userId: user?.id // Pass user ID to the backend
      });

      // Handle cases where 3D Secure is required
      if (data?.status === 'requires_action' || data?.status === 'requires_source_action') {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: paymentMethod.id
        });
        
        if (confirmError) throw confirmError;
        if (paymentIntent?.status !== 'succeeded') {
          throw new Error('Payment was not successful. Please try again.');
        }

        // 3. Finalize on backend after 3DS success
        await api.post('/stripe/confirm-payment', {
          paymentIntentId: paymentIntent.id,
          plan
        });
      } else if (data?.status !== 'succeeded') {
        throw new Error(data?.error || 'Payment failed');
      }
      
      // Refresh profile to update planTier and virtualCardId in state
      await refreshProfile();
      
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500); // Give user time to see the card issued message
    } catch (err: any) {
      console.error('[Checkout] Payment process caught error:', err);
      setPaymentError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#000000',
        '::placeholder': {
          color: '#a1a1aa',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Order Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-zinc-500 hover:text-white transition-colors text-sm font-bold group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Complete your upgrade</h2>
            <p className="text-zinc-500 font-medium">You're one step away from unlocking premium financial features.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-1">Selected Plan</p>
                <h3 className="text-xl font-bold capitalize">{plan} Plan</h3>
              </div>
              <p className="text-2xl font-black">{price}<span className="text-xs text-zinc-500 font-normal ml-1">/mo</span></p>
            </div>

            <ul className="space-y-4">
              {['All standard features', 'Unlimited virtual cards', 'priority 24/7 support', '3.0% Crypto cashback'].map((f, i) => (
                <li key={i} className="flex items-center text-sm text-zinc-400">
                  <CheckCircle2 size={16} className="text-emerald-500 mr-3" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-zinc-800 flex justify-between items-center text-lg font-bold">
              <span>Total to pay</span>
              <span>{price}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-zinc-500">
            <ShieldCheck className="text-emerald-500" size={24} />
            <p className="text-xs font-medium leading-relaxed">
              Your transaction is secured with 256-bit SSL encryption. We never store your full card details.
            </p>
          </div>
        </motion.div>

        {/* Payment Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white text-black rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
        >
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
               <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white"
               >
                 <CheckCircle2 size={40} />
               </motion.div>
               <div className="space-y-4">
                 <h3 className="text-2xl font-black">Payment Successful!</h3>
                 <p className="text-zinc-500 font-medium">Welcome to the {plan} tier. A new virtual card has been issued to your account.</p>
                 <div className="bg-zinc-100 p-4 rounded-2xl border border-zinc-200 mt-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-1">Your new card</p>
                    <p className="font-mono font-bold text-lg">•••• •••• •••• {user?.id || '4456'}</p>
                 </div>
                 <p className="text-zinc-400 text-sm italic pt-4">Redirecting you to your dashboard...</p>
               </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-zinc-400">Payment Details</h3>
                <div className="flex space-x-2">
                   <div className="w-10 h-6 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center text-[8px] font-bold">VISA</div>
                   <div className="w-10 h-6 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center text-[8px] font-bold">MC</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Card Information</label>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>

                {paymentError && (
                  <div className="space-y-4">
                    <div className="text-sm text-rose-500 font-bold bg-rose-50 p-3 rounded-xl flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      {paymentError}
                    </div>
                    
                    {paymentError.includes('401') || paymentError.includes('JWT') || paymentError.includes('Unauthorized') ? (
                      <div className="text-xs text-zinc-500 text-center">
                        Your session may have expired. Please log in again.
                      </div>
                    ) : null}
                  </div>
                )}

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing || !stripe}
                  className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>Pay {price}</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
