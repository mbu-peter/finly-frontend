import { useState, useEffect, useRef } from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      const newUnreadCount = data.filter((n: Notification) => !n.read).length;

      // Check if we have new notifications
      if (newUnreadCount > previousUnreadCount && previousUnreadCount > 0) {
        setHasNewNotifications(true);
        // Remove the "new" indicator after 3 seconds
        setTimeout(() => setHasNewNotifications(false), 3000);
      }

      setNotifications(data);
      setUnreadCount(newUnreadCount);
      setPreviousUnreadCount(newUnreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 10 seconds for more real-time updates
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error': return <X size={16} className="text-rose-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewNotifications(false); // Clear new notification indicator when opened
        }}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors"
      >
        <Bell size={20} className={hasNewNotifications ? 'animate-pulse text-blue-400' : ''} />
        {unreadCount > 0 && (
          <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-[#09090b] ${
            hasNewNotifications ? 'bg-blue-500 animate-ping' : 'bg-rose-500'
          }`}></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm">Notifications</h3>
                {hasNewNotifications && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 animate-pulse">
                    New!
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => !n.read && handleMarkAsRead(n._id)}
                      className={`p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer flex gap-3 ${n.read ? 'opacity-50' : ''}`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(n.type)}
                      </div>
                      <div>
                        <h4 className={`text-sm ${!n.read ? 'font-bold text-white' : 'font-medium text-zinc-400'}`}>
                          {n.title}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-2">
                          {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="ml-auto mt-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
