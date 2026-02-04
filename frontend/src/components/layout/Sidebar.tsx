import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  X,
  // LucideIcon type ለማምጣት (ለ TS ወሳኝ ነው)
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// የ Navigation item አይነትን መግለጽ
interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // Navigation ዝርዝር
  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(isAdmin
      ? [{ name: 'Admin Dashboard', href: '/admin', icon: Users }]
      : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop - ሞባይል ላይ ሲከፈት የቀረውን ገጽ እንዲያደበዝዝ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar - ዋናው የጎን ማውጫ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-gray-900 to-black text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/50 flex items-center justify-center">
                <span className="font-bold text-white italic">A</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Admin<span className="text-indigo-400">Panel</span></span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-800 transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* User Profile Summary */}
          <div className="border-b border-gray-800 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
                <span className="text-lg font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold truncate text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate mb-1">{user?.email}</p>
                <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 p-4 mt-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Logout Section */}
          <div className="border-t border-gray-800 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-gray-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 group"
            >
              <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;