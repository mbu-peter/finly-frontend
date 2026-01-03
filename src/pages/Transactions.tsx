import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, Download, CreditCard, RefreshCw } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const data = await api.get('/transactions');
        setTransactions(data || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft size={18} className="text-emerald-500" />;
      case 'withdrawal': return <ArrowUpRight size={18} className="text-rose-500" />;
      case 'card_spend': return <CreditCard size={18} className="text-blue-500" />;
      default: return <RefreshCw size={18} className="text-zinc-500" />;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' ? true : t.type === filter;
    const matchesSearch = t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.amount.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-zinc-500">Track your financial activity in real-time.</p>
        </div>
        <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Download size={16} />
                <span>Export CSV</span>
            </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
        </div>
        <div className="flex items-center space-x-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
            {['all', 'deposit', 'card_spend', 'withdrawal'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    {f.replace('_', ' ')}
                </button>
            ))}
            <button className="px-3 py-1.5 text-zinc-500 hover:text-white">
                <Filter size={16} />
            </button>
        </div>
      </div>

      <Card className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-sm text-zinc-500 font-medium">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-50">
            <div className="p-4 bg-zinc-900 rounded-full">
                <Clock size={32} />
            </div>
            <p className="text-sm text-zinc-500 font-medium">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase font-black text-zinc-500 tracking-widest">
                  <th className="p-6">Type</th>
                  <th className="p-6">Description</th>
                  <th className="p-6">Date</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredTransactions.map((t) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={t.id} 
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                                {getIcon(t.type)}
                            </div>
                            <span className="text-sm font-bold capitalize">{t.type.replace('_', ' ')}</span>
                        </div>
                    </td>
                    <td className="p-6 text-sm font-medium text-zinc-300">{t.description || 'No description'}</td>
                    <td className="p-6 text-xs text-zinc-500 font-mono">
                        {new Date(t.createdAt).toLocaleDateString()} <span className="text-zinc-700 mx-1">•</span> {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-6">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                            t.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                            {t.status}
                        </span>
                    </td>
                    <td className="p-6 text-right">
                        <span className={`font-mono font-bold ${t.type === 'deposit' ? 'text-emerald-500' : 'text-white'}`}>
                            {t.type === 'deposit' ? '+' : '-'}${t.amount.toFixed(2)}
                        </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transactions;
