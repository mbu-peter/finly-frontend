import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  CreditCard, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { AdminLayout } from './AdminLayout';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

const StatCard = ({ title, value, change, icon: Icon, color }: StatCardProps) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-indigo-500/50 transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={24} className={color.includes('indigo') ? 'text-indigo-500' : color.includes('cyan') ? 'text-cyan-500' : color.includes('emerald') ? 'text-emerald-500' : 'text-amber-500'} />
      </div>
      <div className={`flex items-center space-x-1 text-sm ${change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
        <span>{change}</span>
        {change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [platformStats, usersStats] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUserStats(),
      ]);
      setStats(platformStats);
      setUserStats(usersStats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsight = async () => {
    setIsAiLoading(true);
    try {
      // For now, generate a simple insight based on stats
      const summary = `Total users: ${userStats?.total || 0}, Total transactions: ${stats?.totalTransactions || 0}, Total volume: $${(stats?.totalVolume || 0).toLocaleString()}`;
      setAiInsight(`Based on current platform metrics: ${summary}. The platform shows healthy growth with ${userStats?.activeUsers || 0} active users in the last 30 days.`);
    } catch (err) {
      toast.error('Failed to generate AI insights');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Prepare chart data
  const chartData = stats?.monthlyUsers?.map((mu: any, index: number) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthIndex = (mu._id.month - 1) % 6;
    return {
      name: monthNames[monthIndex] || `Month ${mu._id.month}`,
      users: mu.count,
      transactions: stats.monthlyTransactions?.[index]?.count || 0,
    };
  }) || [];

  if (loading) {
    return (
      <AdminLayout activeTab="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={userStats?.total?.toString() || '0'} 
            change="+12%" 
            icon={Users} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="Total Transactions" 
            value={(stats?.totalTransactions || 0).toLocaleString()} 
            change="+24%" 
            icon={Activity} 
            color="bg-cyan-500" 
          />
          <StatCard 
            title="Revenue (USD)" 
            value={`$${(stats?.totalVolume || 0).toLocaleString()}`} 
            change="+8%" 
            icon={CreditCard} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Active Users" 
            value={userStats?.activeUsers?.toString() || '0'} 
            change="+15%" 
            icon={PieChart} 
            color="bg-amber-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Platform Growth</h2>
              <select className="bg-slate-800 border-none rounded-lg px-3 py-1.5 text-xs text-slate-300">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="transactions" stroke="#06b6d4" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insight Widget */}
          <div className="bg-indigo-600 rounded-2xl p-6 relative overflow-hidden flex flex-col shadow-2xl shadow-indigo-600/20">
            <div className="relative z-10 flex-1">
              <div className="flex items-center space-x-2 text-indigo-100 mb-4">
                <Sparkles size={20} className="text-amber-300" />
                <span className="font-bold text-lg">AI Smart Insights</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-indigo-50 border border-white/20 min-h-[120px] flex items-center justify-center">
                {isAiLoading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="text-xs">Analyzing data...</span>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed italic">
                    {aiInsight || "Tap the button below to generate a deep-dive analysis of your current platform performance."}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={fetchAiInsight}
              disabled={isAiLoading}
              className="mt-6 w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Sparkles size={18} />
              <span>Generate Report</span>
            </button>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Recent Activity Mini-Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Latest Transactions</h2>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-800">
                {[1,2,3].map((i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                          <ArrowDownRight size={16} className="text-rose-500" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">Transaction #{i}</p>
                          <p className="text-xs text-slate-500">Recent activity</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{new Date().toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-white">$0.00</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase">Success</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

