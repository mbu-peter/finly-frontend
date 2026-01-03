// src/components/KlarnaCheckout.tsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface KlarnaCheckoutProps {
  plan: string;
  price: string; // e.g., "$12.00"
}

const KlarnaCheckout: React.FC<KlarnaCheckoutProps> = ({ plan, price }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const initKlarna = async () => {
      if (!window.Klarna || isSuccess) return;

      try {
        setIsLoading(true);
        // Call your backend to create a Klarna session
        const data = await api.post('/stripe/create-klarna-session', { plan });
        if (!data?.client_token) throw new Error('No Klarna client token returned');

        // Initialize Klarna Checkout
        window.Klarna.Payments.init({ client_token: data.client_token });

        window.Klarna.Payments.load({
          container: '#klarna-container',
          payment_method_category: 'pay_later',
        }, (res: any) => {
          if (res.show_form) {
            setIsLoading(false);
          } else {
            setErrorMsg('Klarna form could not be loaded.');
          }
        });
      } catch (err: any) {
        console.error('Klarna initialization error:', err);
        setErrorMsg(err.message || 'Failed to load Klarna payment.');
        setIsLoading(false);
      }
    };

    initKlarna();
  }, [plan, isSuccess]);

  return (
    <div className="mt-6">
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-zinc-500">
          <Loader2 className="animate-spin" size={18} />
          <span>Loading Klarna payment...</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center space-x-2 bg-rose-50 text-rose-500 p-3 rounded-xl font-bold">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-500 p-3 rounded-xl font-bold">
          <CheckCircle2 size={16} />
          <span>Payment successful!</span>
        </div>
      )}

      {/* Klarna renders here */}
      <div id="klarna-container" />
    </div>
  );
};

export default KlarnaCheckout;
