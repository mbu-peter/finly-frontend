import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Reply, MessageSquare, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  receiverId: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  subject: string;
  content: string;
  isRead: boolean;
  messageType: 'user_to_admin' | 'admin_to_user' | 'admin_broadcast';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  replyTo?: {
    _id: string;
    subject: string;
  };
  createdAt: string;
}


const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'sent' | 'received'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchMessages();
  }, [filter, pagination.page]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages?page=${pagination.page}&limit=${pagination.limit}`);
      setMessages(response.messages);
      setPagination(response.pagination);
    } catch (err: any) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    switch (filter) {
      case 'unread':
        return !message.isRead && message.receiverId._id === user?.id;
      case 'sent':
        return message.senderId._id === user?.id;
      case 'received':
        return message.receiverId._id === user?.id;
      default:
        return true;
    }
  });

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    // Mark as read if it's received and unread
    if (message.receiverId._id === user?.id && !message.isRead) {
      try {
        await api.put(`/messages/${message._id}/read`, {});
        // Update local state
        setMessages(prev => prev.map(m =>
          m._id === message._id ? { ...m, isRead: true } : m
        ));
      } catch (err) {
        console.error('Failed to mark as read');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'normal': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 text-blue-500 font-semibold uppercase tracking-wide text-xs"
        >
          <Mail size={12} />
          <span>Messages</span>
        </motion.div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white">
              Messages
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Secure communication with our support team
            </p>
          </div>

          <button
            onClick={() => setShowComposeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={16} />
            New Message
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg w-fit backdrop-blur-sm">
        {[
          { key: 'all', label: 'All', count: messages.length },
          { key: 'unread', label: 'Unread', count: messages.filter(m => !m.isRead && m.receiverId._id === user?.id).length },
          { key: 'sent', label: 'Sent', count: messages.filter(m => m.senderId._id === user?.id).length },
          { key: 'received', label: 'Received', count: messages.filter(m => m.receiverId._id === user?.id).length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === key
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            }`}
          >
            {label} {count > 0 && `(${count})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/50 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                <div className="h-3 bg-zinc-700 rounded w-3/4"></div>
              </div>
            ))
          ) : filteredMessages.length === 0 ? (
            <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
              <Mail className="mx-auto mb-4 text-zinc-600" size={48} />
              <h3 className="text-lg font-bold text-zinc-400 mb-2">No messages yet</h3>
              <p className="text-zinc-600 text-sm">Start a conversation with our support team</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleMessageClick(message)}
                className={`bg-zinc-900/30 rounded-xl p-3 cursor-pointer transition-all hover:bg-zinc-800/40 border ${
                  selectedMessage?._id === message._id
                    ? 'border-blue-500/50 bg-zinc-800/60'
                    : message.isRead
                      ? 'border-zinc-800'
                      : 'border-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                      {message.senderId._id === user?.id ? 'Me' : message.senderId.fullName[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${!message.isRead ? 'text-white' : 'text-zinc-300'}`}>
                          {message.senderId._id === user?.id ? 'To Support' : 'From Support'}
                        </span>
                        {!message.isRead && message.receiverId._id === user?.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-xs ${getPriorityColor(message.priority)} self-start`}>
                        {message.priority.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {formatDate(message.createdAt)}
                  </span>
                </div>

                <h4 className={`text-sm font-medium mb-1 line-clamp-1 ${!message.isRead ? 'text-white' : 'text-zinc-300'}`}>
                  {message.subject}
                </h4>

                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {message.content}
                </p>
              </motion.div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4"
            >
              <div className="border-b border-zinc-700 pb-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {selectedMessage.senderId._id === user?.id ? 'Me' : selectedMessage.senderId.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {selectedMessage.subject}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-zinc-400">
                        <span>
                          {selectedMessage.senderId._id === user?.id ? 'To Support' : 'From Support'}
                        </span>
                        <span>•</span>
                        <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(selectedMessage.priority)}`}>
                          {selectedMessage.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowComposeModal(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-medium transition-all"
                  >
                    <Reply size={14} />
                    <span>Reply</span>
                  </button>
                </div>
              </div>

              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.content}
              </div>

              {selectedMessage.replyTo && (
                <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border-l-4 border-zinc-600">
                  <div className="text-xs text-zinc-400 mb-1">Replying to: {selectedMessage.replyTo.subject}</div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-zinc-900/50 rounded-xl p-12 text-center">
              <MessageSquare className="mx-auto mb-4 text-zinc-600" size={64} />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">Select a message</h3>
              <p className="text-zinc-600">Choose a message from the list to view its contents</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <ComposeMessageModal
          onClose={() => setShowComposeModal(false)}
          onMessageSent={() => {
            setShowComposeModal(false);
            fetchMessages();
          }}
          replyTo={selectedMessage}
        />
      )}
    </div>
  );
};

// Compose Message Modal Component
interface ComposeMessageModalProps {
  onClose: () => void;
  onMessageSent: () => void;
  replyTo?: Message | null;
}

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ onClose, onMessageSent, replyTo }) => {
  const [formData, setFormData] = useState({
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setLoading(true);
    try {
      // Users send messages to admins - the backend will handle routing to all admins
      await api.post('/messages', {
        subject: formData.subject,
        content: formData.content,
        messageType: 'user_to_admin',
        priority: formData.priority,
        replyTo: replyTo?._id,
      });

      toast.success('Message sent successfully!');
      onMessageSent();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              {replyTo ? 'Reply to Message' : 'New Message'}
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Enter message subject..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm w-full"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Message
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-sm"
              placeholder="Type your message here..."
              required
            />
          </div>

          {replyTo && (
            <div className="p-4 bg-zinc-800/50 rounded-lg border-l-4 border-zinc-600">
              <div className="text-sm text-zinc-400 mb-2">Replying to:</div>
              <div className="text-sm text-zinc-300 font-medium">{replyTo.subject}</div>
              <div className="text-sm text-zinc-500 mt-1 line-clamp-2">{replyTo.content}</div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Messages;
