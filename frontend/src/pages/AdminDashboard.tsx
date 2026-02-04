import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthContext'; 
import api from '../api/axiosConfig'; 
import UserTable from '../components/users/UserTable'; 
import UserModal from '../components/Admin/UserModal'; 
import { Users, Shield, UserCheck, UserPlus, Plus, LayoutDashboard } from 'lucide-react';
import type { User } from '../types';

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState({
    totalUsers: 0, totalAdmins: 0, activeToday: 0, newUsers: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/auth/admin/stats');
      const data = response.data.data || response.data; 
      setStats({
        totalUsers: data.totalUsers || 0,
        totalAdmins: data.totalAdmins || 0,
        activeToday: data.activeToday || 0,
        newUsers: data.newUsers || 0
      });
    } catch (error) { console.error("Stats fetch failed"); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats, refreshKey]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-3 sm:p-5 space-y-5 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* 1. Header - More compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md">
             <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">System Overview</p>
          </div>
        </div>
        
        <button 
          onClick={handleAddUser}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* 2. Stats Grid - Smaller cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total" value={stats.totalUsers} icon={<Users size={18}/>} color="indigo" />
        <StatCard title="Admins" value={stats.totalAdmins} icon={<Shield size={18}/>} color="purple" />
        <StatCard title="Active" value={stats.activeToday} icon={<UserCheck size={18}/>} color="emerald" />
        <StatCard title="New" value={stats.newUsers} icon={<UserPlus size={18}/>} color="blue" />
      </div>

      {/* 3. Simple Welcome - Less height */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-5 text-white shadow-lg">
        <div className="relative z-10">
          <h2 className="text-lg font-bold">Welcome, {currentUser?.name}!</h2>
          <p className="text-slate-400 text-xs mt-1">
            System is healthy with <span className="text-indigo-400 font-bold">{stats.totalUsers} total users</span>.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-500/10 blur-2xl" />
      </div>

      {/* 4. User Table - Cleaner look */}
      <div ref={tableRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">User Directory</h3>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
          </div>
        </div>
        <div className="p-1 sm:p-2">
            <UserTable 
              key={refreshKey} 
              onEditUser={(u) => { setSelectedUser(u); setIsModalOpen(true); }} 
              onAddUser={handleAddUser} 
            />
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); setRefreshKey(k => k + 1); }}
        user={selectedUser}
      />
    </div>
  );
};

// --- Compact Stat Card ---
const StatCard = ({ title, value, icon, color }: any) => {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600"
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-hover hover:border-indigo-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{title}</p>
          <p className="text-lg font-bold text-slate-900 leading-none mt-0.5">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;