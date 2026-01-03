import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, CreditCard, LayoutDashboard } from 'lucide-react';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="text-green-500" size={48} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-black mb-4"
        >
          Upgrade Successful!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 mb-12 text-lg"
        >
          Your account has been upgraded and your virtual card is ready for use.
        </motion.p>

        <div className="grid grid-cols-1 gap-4">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/cards')}
            className="flex items-center justify-center gap-2 bg-white text-black h-14 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
          >
            <CreditCard size={20} />
            View My Virtual Card
            <ArrowRight size={18} />
          </motion.button>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-white h-14 rounded-2xl font-bold hover:bg-zinc-800 transition-colors"
          >
            <LayoutDashboard size={20} />
            Go to Dashboard
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Success;
