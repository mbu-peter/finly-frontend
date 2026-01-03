import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Users, MessageSquare, Clock, Reply } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { AdminLayout } from './AdminLayout';

interface UserWithMessages {
  _id: string;
  fullName: string;
  email: string;
  unreadMessages: number;
  lastMessageAt: string | null;
}

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
  createdAt: string;
}

export const AdminMessages = () => {
  const [users, setUsers] = useState<UserWithMessages[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithMessages | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [replyRecipient, setReplyRecipient] = useState<UserWithMessages | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithMessages[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUsers();
    fetchUnreadCount();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/messages/admin/users');
      setUsers(data);
    } catch (err: any) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/admin/unread-count');
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchConversation = async (userId: string) => {
    try {
      const messages = await api.get(`/messages/conversation/${userId}`);
      setConversation(messages);
      // Refresh unread count after viewing conversation
      fetchUnreadCount();
    } catch (err: any) {
      toast.error('Failed to load conversation');
    }
  };

  const handleUserSelect = (user: UserWithMessages) => {
    setSelectedUser(user);
    fetchConversation(user._id);
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    try {
      const results = await api.get(`/messages/admin/search-users?q=${encodeURIComponent(query)}`);
      setSearchResults(results);
      setShowSearchDropdown(true);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleSearchSelect = (user: UserWithMessages) => {
    setReplyRecipient(user);
    setSearchQuery(user.fullName);
    setShowSearchDropdown(false);
    setBroadcastMode(false);
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTotalUnread = users.reduce((sum, user) => sum + user.unreadMessages, 0);

  return (
    <AdminLayout activeTab="messages" unreadMessageCount={unreadCount}>
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-xs"
        >
          <Mail size={14} />
          <span>Message Center</span>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              Admin Messages
            </h1>
            <p className="text-zinc-500 text-lg mt-2">
              Manage communications with users
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipient..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                onBlur={() => {
                  // Delay hiding to allow click on dropdown
                  setTimeout(() => setShowSearchDropdown(false), 200);
                }}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              />
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleSearchSelect(user)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-zinc-400">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setBroadcastMode(true);
                setReplyRecipient(null);
                setSearchQuery('');
                setShowComposeModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-all"
            >
              <Users size={16} />
              Broadcast
            </button>
            <button
              onClick={() => {
                if (replyRecipient) {
                  setBroadcastMode(false);
                  setShowComposeModal(true);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-all"
              disabled={!replyRecipient}
            >
              <Send size={16} />
              Send Message
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Unread Messages</p>
              <p className="text-2xl font-bold text-red-400">{getTotalUnread}</p>
            </div>
            <Mail className="text-red-500" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Active Conversations</p>
              <p className="text-2xl font-bold text-green-400">
                {users.filter(u => u.lastMessageAt).length}
              </p>
            </div>
            <MessageSquare className="text-green-500" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Response Time</p>
              <p className="text-2xl font-bold text-blue-400">&lt; 5min</p>
            </div>
            <Clock className="text-blue-500" size={24} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-bold text-white mb-4">Users</h3>

          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/50 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                <div className="h-3 bg-zinc-700 rounded w-3/4"></div>
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
              <Users className="mx-auto mb-4 text-zinc-600" size={32} />
              <p className="text-zinc-500 text-sm">No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleUserSelect(user)}
                className={`bg-zinc-900/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-zinc-800/50 border-l-4 ${
                  selectedUser?._id === user._id
                    ? 'border-l-blue-500 bg-zinc-800/50'
                    : user.unreadMessages > 0
                      ? 'border-l-red-500'
                      : 'border-l-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {user.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{user.fullName}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </div>
                  </div>
                  {user.unreadMessages > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {user.unreadMessages}
                    </div>
                  )}
                </div>

                {user.lastMessageAt && (
                  <div className="text-xs text-zinc-600">
                    Last message: {new Date(user.lastMessageAt).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Conversation */}
        <div className="lg:col-span-3">
          {selectedUser ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedUser.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedUser.fullName}</h3>
                      <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedUser && selectedUser._id) {
                        setBroadcastMode(false);
                        setReplyRecipient(selectedUser);
                        setShowComposeModal(true);
                      } else {
                        toast.error('Please select a user to reply to');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all"
                    disabled={!selectedUser}
                  >
                    <Reply size={16} />
                    Reply
                  </button>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {conversation.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    <MessageSquare className="mx-auto mb-4" size={32} />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  conversation.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.senderId.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md rounded-2xl px-4 py-3 ${
                        message.senderId.role === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`text-xs font-medium ${
                            message.senderId.role === 'admin' ? 'text-blue-200' : 'text-zinc-400'
                          }`}>
                            {message.senderId.role === 'admin' ? 'You' : message.senderId.fullName}
                          </div>
                          <div className={`text-xs ${getPriorityColor(message.priority)} px-2 py-1 rounded`}>
                            {message.priority.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-sm font-medium mb-1">{message.subject}</div>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-2 ${
                          message.senderId.role === 'admin' ? 'text-blue-200' : 'text-zinc-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-zinc-900/50 rounded-xl p-12 text-center">
              <Users className="mx-auto mb-4 text-zinc-600" size={64} />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">Select a user</h3>
              <p className="text-zinc-600">Choose a user from the list to view their conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (broadcastMode || (replyRecipient || selectedUser)) && (
        <ComposeMessageModal
          onClose={() => {
            setShowComposeModal(false);
            setReplyRecipient(null);
          }}
          onMessageSent={() => {
            setShowComposeModal(false);
            if (selectedUser && !broadcastMode) {
              fetchConversation(selectedUser._id);
            }
            fetchUsers();
          }}
          recipient={broadcastMode ? null : (replyRecipient || selectedUser)}
          broadcastMode={broadcastMode}
        />
      )}
      </div>
    </AdminLayout>
  );
};

// Compose Message Modal Component
interface ComposeMessageModalProps {
  onClose: () => void;
  onMessageSent: () => void;
  recipient: UserWithMessages | null;
  broadcastMode: boolean;
}

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  onClose,
  onMessageSent,
  recipient,
  broadcastMode
}) => {
  const [formData, setFormData] = useState({
    subject: '',
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

    if (!broadcastMode && (!recipient || !recipient._id)) {
      console.error('Invalid recipient:', recipient);
      toast.error('No valid recipient selected. Please select a user first.');
      return;
    }

    setLoading(true);
    try {
      if (broadcastMode) {
        await api.post('/messages/admin/broadcast', {
          subject: formData.subject,
          content: formData.content,
          priority: formData.priority,
        });
        toast.success('Broadcast message sent to all users!');
      } else if (recipient) {
        await api.post('/messages', {
          receiverId: recipient._id,
          subject: formData.subject,
          content: formData.content,
          messageType: 'admin_to_user',
          priority: formData.priority,
        });
        toast.success('Message sent successfully!');
      }

      onMessageSent();
      onClose();
      setFormData({ subject: '', content: '', priority: 'normal' });
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
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm max-h-[65vh] overflow-hidden shadow-2xl"
      >
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              {broadcastMode ? 'Broadcast Message' : 'Send Message'}
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
          {recipient && (
            <p className="text-xs text-zinc-500 mt-1">
              To: {recipient.fullName}
            </p>
          )}
          {broadcastMode && (
            <p className="text-xs text-zinc-500 mt-1">
              This message will be sent to ALL users
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2.5">
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
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-sm"
              placeholder="Type your message here..."
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
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
                  <span>{broadcastMode ? 'Broadcast' : 'Send'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
