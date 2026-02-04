import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { User as UserIcon, Mail, Lock, ShieldCheck, Save,  Loader2 } from 'lucide-react';

interface AddEditUserFormProps {
  user: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddEditUserForm: React.FC<AddEditUserFormProps> = ({ user, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', 
        role: user.role,
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'user' });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update user (Including Email, Name, Role, Password)
        await api.put(`/auth/admin/update-user/${user.id}`, formData);
        toast.success('Account updated successfully!');
      } else {
        // Create new user
        await api.post('/auth/admin/create-user', formData);
        toast.success('Account created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Input: Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <UserIcon size={14} /> Full Name
          </label>
          <input
            required
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Abebe Balcha"
          />
        </div>

        {/* Input: Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Mail size={14} /> Email Address
          </label>
          <input
            required
            type="email"
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="abebe@example.com"
          />
        </div>

        {/* Input: Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Lock size={14} /> Password
          </label>
          <input
            type="password"
            required={!user}
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder={user ? "Leave blank to keep current" : "••••••••"}
          />
        </div>

        {/* Input: Role */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <ShieldCheck size={14} /> Access Level
          </label>
          <select
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="user">Standard User</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {user ? 'Update' : 'Register'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditUserForm;