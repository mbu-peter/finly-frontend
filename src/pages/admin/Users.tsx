import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, Shield, ShieldOff } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email: string;
  role: 'user' | 'admin';
  status?: 'active' | 'suspended';
  createdAt: string;
  transactions: number;
}

const UserTable = ({ 
  users, 
  onDelete, 
  onToggleStatus,
  onPromote,
  onDemote
}: { 
  users: User[]; 
  onDelete: (id: string) => void; 
  onToggleStatus: (id: string) => void;
  onPromote?: (id: string) => void;
  onDemote?: (id: string) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider">
          <th className="px-6 py-4 font-semibold">User</th>
          <th className="px-6 py-4 font-semibold">Status</th>
          <th className="px-6 py-4 font-semibold">Role</th>
          <th className="px-6 py-4 font-semibold">Joined</th>
          <th className="px-6 py-4 font-semibold">Transactions</th>
          <th className="px-6 py-4 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
        {users.map((user) => (
          <tr key={user.id || user._id} className="hover:bg-slate-800/30 transition-colors group">
            <td className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                  {(user.fullName || user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-medium">{user.fullName || user.name || 'No Name'}</div>
                  <div className="text-slate-400 text-xs">{user.email}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                user.status === 'active' || !user.status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {user.status || 'active'}
              </span>
            </td>
            <td className="px-6 py-4 text-slate-300 capitalize text-sm">{user.role}</td>
            <td className="px-6 py-4 text-slate-400 text-sm">
              {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-white font-mono text-sm">{user.transactions || 0}</td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end space-x-2">
                {user.role === 'admin' ? (
                  <button 
                    onClick={() => onDemote && onDemote(user.id || user._id!)}
                    className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                    title="Demote from Admin"
                  >
                    <ShieldOff size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={() => onPromote && onPromote(user.id || user._id!)}
                    className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Promote to Admin"
                  >
                    <Shield size={18} />
                  </button>
                )}
                <button 
                  onClick={() => onToggleStatus(user.id || user._id!)}
                  className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                  title={user.status === 'active' || !user.status ? 'Suspend' : 'Activate'}
                >
                  {user.status === 'active' || !user.status ? <XCircle size={18} /> : <CheckCircle size={18} />}
                </button>
                <button 
                  onClick={() => onDelete(user.id || user._id!)}
                  className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete User"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      });
      setUsers(data.users || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        fetchUsers();
      } else {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return;
    }

    try {
      await api.admin.deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const toggleUserStatus = async (_id: string) => {
    // For now, just show a message - you can implement suspend/activate endpoint later
    toast.info('Status toggle feature coming soon');
  };

  const promoteUser = async (id: string) => {
    try {
      await api.admin.promoteUser(id);
      toast.success('User promoted to admin');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to promote user');
    }
  };

  const demoteUser = async (id: string) => {
    if (!confirm('Are you sure you want to demote this admin to regular user?')) {
      return;
    }
    try {
      await api.admin.demoteUser(id);
      toast.success('Admin demoted to user');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to demote user');
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => 
      (u.fullName || u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  if (loading && users.length === 0) {
    return (
      <AdminLayout activeTab="users">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="users">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Users Directory</h2>
            <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {pagination.total} Users
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors">
              <Plus size={18} />
              <span>Invite User</span>
            </button>
          </div>
        </div>
        <UserTable 
          users={filteredUsers} 
          onDelete={deleteUser} 
          onToggleStatus={toggleUserStatus}
          onPromote={promoteUser}
          onDemote={demoteUser}
        />
        {pagination.pages > 1 && (
          <div className="p-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-slate-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

