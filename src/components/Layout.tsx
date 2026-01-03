import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Activity, TrendingUp, Settings, Menu, X, Info, FileText, Shield, ArrowLeftRight, Wallet, TrendingDown, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoutButton } from './LogoutButton';
import { NotificationBell } from './NotificationBell';
import { ChatAgent } from './ChatAgent';
import { api } from '../lib/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const isLoggedIn = !!user;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ArrowLeftRight, label: 'P2P Trading', path: '/p2p' },
    { icon: Wallet, label: 'My Wallets', path: '/wallets' },
    { icon: CreditCard, label: 'Virtual Cards', path: '/cards' },
    { icon: TrendingUp, label: 'Crypto', path: '/crypto' },
    { icon: Activity, label: 'Transactions', path: '/transactions' },
    { icon: Info, label: 'About', path: '/about' },
    { icon: FileText, label: 'Blogs', path: '/blogs' },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    ...(isAdmin() ? [{ icon: Shield, label: 'Admin', path: '/admin/dashboard' }] : []),
  ];

  const userName = profile?.fullName || user?.email?.split('@')[0] || 'User';
  const planTier = profile?.planTier || 'basic';

  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadMessageCount();
    }
  }, [isLoggedIn]);

  const fetchUnreadMessageCount = async () => {
    try {
      // Get a large page of messages to count unread ones
      const allMessages = await api.get('/messages?page=1&limit=1000');
      const unread = allMessages.messages.filter((msg: any) => !msg.isRead && msg.receiverId._id === user?.id).length;
      setUnreadMessageCount(unread);
    } catch (err) {
      console.error('Failed to fetch unread message count');
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Only show for logged in users */}
      {isLoggedIn && (
        <aside className={`
          fixed inset-y-0 left-0 z-[50] w-56 border-r border-zinc-800 bg-[#09090b] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
        <div className="p-6 flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Finly
          </NavLink>
          <button className="lg:hidden text-zinc-400" onClick={toggleMobileMenu}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => {
                setIsMobileMenuOpen(false);
                // Refresh unread count when navigating to messages
                if (item.path === '/messages') {
                  setTimeout(fetchUnreadMessageCount, 1000);
                }
              }}
              className={({ isActive }) => `
                w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all
                ${isActive
                   ? 'bg-zinc-800/80 text-white shadow-lg shadow-black/20 border border-zinc-700/30'
                   : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'}
              `}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={16} />
                <span className="font-medium text-xs">{item.label}</span>
              </div>
              {item.label === 'Messages' && unreadMessageCount > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-900">
          <LogoutButton className="w-full" />
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-8 bg-[#09090b]/80 backdrop-blur-xl z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-zinc-900 rounded-lg text-zinc-400"
              onClick={toggleMobileMenu}
            >
              <Menu size={20} />
            </button>

            {/* Live Crypto Prices */}
            <div className="hidden md:flex items-center space-x-4">
              <LivePriceTicker symbol="BTC" />
              <LivePriceTicker symbol="ETH" />
              <TopGainer />
            </div>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-4">
            <NotificationBell />
            {isAdmin() && (
              <>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition-all group"
                >
                  <Shield size={16} className="text-indigo-400 group-hover:text-indigo-300" />
                  <span className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300">Switch to Admin</span>
                </button>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="sm:hidden p-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg transition-all"
                  title="Switch to Admin"
                >
                  <Shield size={18} className="text-indigo-400" />
                </button>
              </>
            )}
            {isLoggedIn && (
              <div className="flex items-center space-x-3 pl-3 lg:pl-4 border-l border-zinc-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold">{userName}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{planTier} Plan</p>
                </div>
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-zinc-700 flex items-center justify-center font-bold text-xs">
                  {userName[0].toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          {children}
        </div>
      </main>
      <ChatAgent />
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
        const { api } = await import('../lib/api');
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
        <span className="text-zinc-400">{symbol}:</span>
        <div className="w-8 h-3 bg-zinc-700 rounded animate-pulse"></div>
      </div>
    );
  }

  // Determine real-time trend based on price change
  const isPriceRising = price !== null && previousPrice !== null && price > previousPrice;
  const isPriceFalling = price !== null && previousPrice !== null && price < previousPrice;

  return (
    <div className="flex items-center space-x-1 text-xs">
      <span className="text-zinc-400 font-medium">{symbol}:</span>
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
        const { api } = await import('../lib/api');
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
        <span className="text-zinc-400">Top:</span>
        <div className="w-6 h-3 bg-zinc-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!topGainer) return null;

  return (
    <div className="flex items-center space-x-1 text-xs">
      <span className="text-zinc-400">Top:</span>
      <span className="text-white font-medium">{topGainer.symbol}</span>
      <div className="flex items-center text-green-400">
        <TrendingUp size={10} />
        <span className="ml-0.5">+{topGainer.price_change_percentage_24h?.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default Layout;
