import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal'; 
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  UserPlus, 
  UserCog 
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  });
  const [loading, setLoading] = useState(false);

  // ሞዳሉ ሲከፈት መረጃውን ለማደስ
  useEffect(() => {
    if (user && isOpen) {
      // ለ Edit: ነባር መረጃን መሙላት
      setFormData({ 
        name: user.name, 
        email: user.email, 
        password: '', 
        role: user.role 
      });
    } else if (isOpen) {
      // ለ Create: ባዶ ማድረግ
      setFormData({ name: '', email: '', password: '', role: 'user' });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        // 🔄 UPDATE: ስም፣ ኢሜይል፣ ሮል እና (ካለ) ፓስወርድ ይልካል
        await api.put(`/auth/admin/update-user/${user.id}`, formData);
        toast.success('User updated! (ተጠቃሚው ተስተካክሏል)');
      } else {
        // ✨ CREATE: አዲስ ተጠቃሚ መፍጠር
        await api.post('/auth/admin/create-user', formData);
        toast.success('User created! (ተጠቃሚው ተፈጥሯል)');
      }
      onSuccess(); // ሊስቱን Refresh ለማድረግ
      onClose();   // ሞዳሉን ለመዝጋት
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2 text-indigo-700">
          {user ? <UserCog size={22} /> : <UserPlus size={22} />}
          <span>{user ? 'Edit User (ተጠቃሚ አርም)' : 'Add New User (አዲስ ጨምር)'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name */}
        <InputField 
          label="Full Name (ሙሉ ስም)" 
          icon={<UserIcon size={16}/>}
          type="text"
          placeholder="Enter full name"
          value={formData.name}
          onChange={(val) => setFormData({...formData, name: val})}
          required
        />
        
        {/* Email - አሁን Edit ሲደረግም እንዲሰራ ተደርጓል */}
        <InputField 
          label="Email Address (ኢሜይል)" 
          icon={<Mail size={16}/>}
          type="email"
          placeholder="example@mail.com"
          value={formData.email}
          onChange={(val) => setFormData({...formData, email: val})}
          required
        />

        {/* Password */}
        <InputField 
          label="Password (የይለፍ ቃል)" 
          icon={<Lock size={16}/>}
          type="password"
          placeholder={user ? "Leave blank to keep current" : "••••••••"}
          value={formData.password}
          onChange={(val) => setFormData({...formData, password: val})}
          required={!user} // አዲስ ሲሆን የግድ ነው
        />

        {/* Role Selection */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
            Role (የስልጣን እርከን)
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
<select 
  className={`w-full rounded-xl border p-3 pl-10 outline-none focus:ring-2 transition-all font-bold 
    ${formData.role === 'admin' ? 'border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-500' : 'border-gray-100 bg-gray-50 text-gray-700 focus:ring-indigo-500'}`}
  value={formData.role}
  onChange={(e) => setFormData({...formData, role: e.target.value as 'user' | 'admin'})}
>
  <option value="user">Standard User (ተራ ተጠቃሚ)</option>
  <option value="admin">Administrator (አድሚን)</option>
</select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
          >
            Cancel (ተው)
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-indigo-600 py-3 font-bold text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              user ? 'Update User' : 'Create User'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* --- 📝 Input Field Helper Component --- */
interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (val: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, icon, type, value, placeholder, required, onChange }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input 
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium" 
      />
    </div>
  </div>
);

export default UserModal;