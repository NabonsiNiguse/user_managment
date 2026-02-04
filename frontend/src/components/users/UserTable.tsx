import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, UserPlus, ShieldCheck, Mail, Calendar } from 'lucide-react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import LoadingSpinner from '../layout/LoadingSpinner';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface UserTableProps {
  onEditUser: (user: User) => void;
  onAddUser: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ onEditUser, onAddUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 10 });

  const fetchUsers = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const response = await api.get('/auth/admin/users', {
        params: { page, limit: pagination.limit, search: searchTerm },
      });
      const { users: fetchedUsers, pagination: pData } = response.data.data || response.data;
      setUsers(fetchedUsers);
      setPagination(pData);
    } catch (error) {
      toast.error('ተጠቃሚዎችን መጫን አልተቻለም');
    } finally {
      setLoading(false);
    }
  };

  // --- ADDED: Delete Logic ---
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/auth/admin/users/${id}`);
      toast.success('ተጠቃሚው ተሰርዟል'); // User deleted successfully
      fetchUsers(pagination.currentPage, search); // Refresh table
    } catch (error: any) {
      const message = error.response?.data?.message || 'መሰረዝ አልተቻለም';
      toast.error(message);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchUsers(1, search), 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40">
      
      {/* 🔍 Search & Action Header */}
      <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-white to-slate-50/50">
        <div className="relative w-full md:w-1/2 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-600 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={onAddUser}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-6">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 font-bold tracking-widest text-sm uppercase animate-pulse">Loading Records...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Role</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Joined Date</th>
                <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-100">
                        {getInitials(user.name)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{user.name}</div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium italic">
                          <Mail size={13} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border shadow-sm ${
                      user.role === 'admin' 
                      ? 'bg-purple-50 text-purple-600 border-purple-100' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {user.role === 'admin' ? <ShieldCheck size={14} /> : <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => onEditUser(user)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      
                      {/* --- UPDATED: Click handler added here --- */}
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 📄 Pagination */}
      {!loading && users.length > 0 && (
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-800">{users.length}</span> out of <span className="text-slate-800">{pagination.total}</span> entries
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={pagination.currentPage === 1}
              onClick={() => fetchUsers(pagination.currentPage - 1, search)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchUsers(i + 1, search)}
                  className={`h-10 w-10 rounded-xl text-sm font-black transition-all ${
                    pagination.currentPage === i + 1 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-white text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={pagination.currentPage === pagination.pages}
              onClick={() => fetchUsers(pagination.currentPage + 1, search)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;