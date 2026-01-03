import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  Image,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  TrendingUp,
  ArrowLeft,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  unreadCount?: number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, unreadCount }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
      active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
    {unreadCount && unreadCount > 0 && (
      <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
        {unreadCount > 99 ? '99+' : unreadCount}
      </div>
    )}
  </button>
);

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'users' | 'blogs' | 'messages' | 'content' | 'settings';
  unreadMessageCount?: number;
}

export const AdminLayout = ({ children, activeTab, unreadMessageCount }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const handleTabChange = (tab: 'dashboard' | 'users' | 'blogs' | 'messages' | 'content' | 'settings') => {
    navigate(`/admin/${tab}`);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
            <TrendingUp className="text-white" size={24} />
          </div>
          {isSidebarOpen && <span className="text-2xl font-bold text-white tracking-tight">Vibe<span className="text-indigo-500">Admin</span></span>}
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => handleTabChange('dashboard')}
          />
          <SidebarItem
            icon={Users}
            label="Users"
            active={activeTab === 'users'}
            onClick={() => handleTabChange('users')}
          />
          <SidebarItem
            icon={FileText}
            label="Blogs"
            active={activeTab === 'blogs'}
            onClick={() => handleTabChange('blogs')}
          />
          <SidebarItem
            icon={Mail}
            label="Messages"
            active={activeTab === 'messages'}
            onClick={() => handleTabChange('messages')}
            unreadCount={unreadMessageCount}
          />
          <SidebarItem
            icon={Image}
            label="Content"
            active={activeTab === 'content'}
            onClick={() => navigate('/admin/content')}
          />
          <SidebarItem
            icon={Settings}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => handleTabChange('settings')}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your platform operations efficiently.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all group"
            >
              <ArrowLeft size={16} className="text-slate-400 group-hover:text-white" />
              <span className="text-sm font-medium text-slate-400 group-hover:text-white">Switch to Regular Dashboard</span>
            </button>
            <button className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>

            {/* Live Crypto Prices */}
            <div className="hidden md:flex items-center space-x-4 pl-4 border-l border-slate-800">
              <LivePriceTicker symbol="BTC" />
              <LivePriceTicker symbol="ETH" />
              <TopGainer />
            </div>

            <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{profile?.fullName || 'Admin User'}</p>
                <p className="text-xs text-slate-500 mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
                {getInitials(profile?.fullName)}
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 md:hidden">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

// Live Price Ticker Component
const LivePriceTicker = ({ symbol }: { symbol: string }) => {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const { api } = await import('../../lib/api');
        const data = await api.get('/market/prices');
        const coinData = data.find((coin: any) => coin.symbol.toLowerCase() === symbol.toLowerCase());
        if (coinData) {
          const currentPrice = coinData.current_price;
          setPreviousPrice(price); // Store previous price for trend
          setPrice(currentPrice);
          setChange(coinData.price_change_percentage_24h);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 300); // Update every 300ms for ultra-fast updates
    return () => clearInterval(interval);
  }, [symbol, price]);

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-xs">
        <span className="text-slate-400">{symbol}:</span>
        <div className="w-8 h-3 bg-slate-700 rounded animate-pulse"></div>
      </div>
    );
  }

  // Determine real-time trend based on price change
  const isPriceRising = price !== null && previousPrice !== null && price > previousPrice;
  const isPriceFalling = price !== null && previousPrice !== null && price < previousPrice;

  return (
    <div className="flex items-center space-x-1 text-xs">
      <span className="text-slate-400 font-medium">{symbol}:</span>
      <span className={`font-mono transition-colors duration-200 ${
        isPriceRising ? 'text-green-400' :
        isPriceFalling ? 'text-red-400' :
        'text-white'
      }`}>
        ${price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 'N/A'}
      </span>
      {change !== null && (
        <div className={`flex items-center transition-colors duration-200 ${
          change >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          <span className="ml-0.5">{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

// Top Gainer Component
const TopGainer = () => {
  const [topGainer, setTopGainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopGainer = async () => {
      try {
        const { api } = await import('../../lib/api');
        const data = await api.get('/market/prices');
        if (data && data.length > 0) {
          // Find the coin with highest 24h change
          const sorted = data.sort((a: any, b: any) =>
            b.price_change_percentage_24h - a.price_change_percentage_24h
          );
          setTopGainer(sorted[0]);
        }
      } catch (error) {
        console.error('Error fetching top gainer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopGainer();
    const interval = setInterval(fetchTopGainer, 300); // Update every 300ms for ultra-fast updates
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-xs">
        <span className="text-slate-400">Top:</span>
        <div className="w-6 h-3 bg-slate-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!topGainer) return null;

  return (
    <div className="flex items-center space-x-1 text-xs">
      <span className="text-slate-400">Top:</span>
      <span className="text-white font-medium">{topGainer.symbol}</span>
      <div className="flex items-center text-green-400">
        <TrendingUp size={10} />
        <span className="ml-0.5">+{topGainer.price_change_percentage_24h?.toFixed(1)}%</span>
      </div>
    </div>
  );
};

