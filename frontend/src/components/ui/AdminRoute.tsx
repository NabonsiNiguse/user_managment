import React, { type ReactNode } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../layout/LoadingSpinner';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 1. ተጠቃሚው ጭራሹኑ ካልገባ ወደ login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. ተጠቃሚው ከገባ ግን አድሚን ካልሆነ ወደ ተራው dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. አድሚን ከሆነ ገጹን እንዲያይ ፍቀድለት
  return <>{children}</>;
};

export default AdminRoute;