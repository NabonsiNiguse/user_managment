import React, { useState, useEffect } from 'react';
import {
  User, Calendar, Shield, Mail, Clock, Activity,
  TrendingUp, Settings, Key, Edit2, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/layout/LoadingSpinner';


const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  // State to hold the real profile data fetched from backend
  const [profile, setProfile] = useState<any>(null);

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        // Assuming your backend returns { success: true, data: { ... } }
        const userData = response.data.data || response.data;
        
        setProfile(userData);
        setFormData({ name: userData.name, email: userData.email });
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle Profile Update
  const handleUpdate = async () => {
    if (!formData.name.trim()) return toast.error('Name cannot be empty.');
    
    try {
      // Sending update request to backend
useEffect(() => {
  api.get('/auth/admin/stats').then((_res) => {
    // 'res' አሁን '_res' ስለሆነ ስህተት አይመጣም
  });
}, []);
      
      // Update local state immediately
      setProfile({ ...profile, name: formData.name });
      
      // Update global Auth Context (so Sidebar/Header updates instantly)
      if (user) {
        updateUser({ ...user, name: formData.name });
      }

      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  if (loading) return <LoadingSpinner size="xl" className="h-screen" />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium">
            Welcome back, <span className="text-indigo-600 font-bold">{profile?.name}</span>!
          </p>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-2">
             <Shield size={16} /> {profile?.role?.toUpperCase() || 'USER'}
           </span>
        </div>
      </div>

      {/* 2. Key Statistics Cards (Dynamic Data Placeholders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Account Status" 
          value="Active" 
          icon={<CheckCircle />} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatCard 
          title="Total Logins" 
          value="3" 
          icon={<TrendingUp />} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatCard 
          title="Security Level" 
          value="High" 
          icon={<Key />} 
          color="text-orange-600" 
          bg="bg-orange-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Main Profile Section (Editable) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
              <button 
                onClick={() => {
                  setEditing(!editing);
                  // Reset form data if cancelling
                  if (editing) setFormData({ name: profile.name, email: profile.email });
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  editing ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                {editing ? <><XCircle size={16}/> Cancel</> : <><Edit2 size={16}/> Edit Profile</>}
              </button>
            </div>

            {editing ? (
              <div className="space-y-5 max-w-md animate-in fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-gray-800"
                  />
                </div>
                <div className="space-y-2 opacity-60 cursor-not-allowed">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email (Cannot be changed)</label>
                  <input 
                    type="text" 
                    value={formData.email} 
                    disabled
                    className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl outline-none font-bold text-gray-500"
                  />
                </div>
                <button 
                  onClick={handleUpdate}
                  className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem icon={<User />} label="Full Name" value={profile?.name} />
                <InfoItem icon={<Mail />} label="Email Address" value={profile?.email} />
                <InfoItem icon={<Calendar />} label="Joined Date" value={new Date(profile?.created_at).toLocaleDateString()} />
                <InfoItem icon={<Activity />} label="Role" value={profile?.role} isBadge />
              </div>
            )}
          </div>

          {/* 4. Security Banner */}
          <div className="bg-gradient-to-br from-slate-800 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Settings size={180} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Security & Settings</h3>
              <p className="text-gray-400 mb-6 text-sm max-w-sm">
                Manage your password and security preferences to keep your account safe.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Recent Activity Sidebar (Visual Only - Connect to API later) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-gray-400" /> Recent Activity
            </h3>
            <div className="space-y-6">
              <ActivityLog action="Login Successful" time="Just now" isLast={false} />
              <ActivityLog action="Profile Updated" time="2 hours ago" isLast={false} />
              <ActivityLog action="Password Changed" time="Yesterday" isLast={true} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Reusable UI Components ---

const StatCard = ({ title, value, icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between hover:border-indigo-200 transition-all group cursor-default">
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
    <div className={`p-4 ${bg} ${color} rounded-2xl group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
  </div>
);

const InfoItem = ({ icon, label, value, isBadge }: any) => (
  <div className="flex items-center gap-4 group">
    <div className="text-indigo-500 bg-indigo-50 p-3 rounded-xl transition-colors group-hover:bg-indigo-600 group-hover:text-white">
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5">{label}</p>
      {isBadge ? (
        <span className="inline-block px-3 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold uppercase">
          {value}
        </span>
      ) : (
        <p className="text-sm font-bold text-gray-800">{value}</p>
      )}
    </div>
  </div>
);

const ActivityLog = ({ action, time, isLast }: any) => (
  <div className="flex gap-4 relative">
    {!isLast && <div className="absolute left-[11px] top-8 bottom-[-8px] w-0.5 bg-gray-100" />}
    <div className="h-6 w-6 rounded-full bg-indigo-50 border-2 border-indigo-500 z-10 flex items-center justify-center shrink-0">
       <div className="h-2 w-2 bg-indigo-500 rounded-full" />
    </div>
    <div>
      <p className="text-sm font-bold text-gray-800 leading-none">{action}</p>
      <p className="text-xs text-gray-400 mt-1.5 font-medium">{time}</p>
    </div>
  </div>
);

export default Dashboard;