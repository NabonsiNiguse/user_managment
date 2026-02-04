import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode; // እዚህ ጋር 'type ReactNode' ስለመጣን React.ReactNode አያስፈልግም
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 1. ካልገባ ወደ Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. አድሚን ካልሆነና ገጹ አድሚን የሚጠይቅ ከሆነ ወደ Dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. የገባ ተጠቃሚ ከሆነ የፈለገውን ገጽ (children) እንዲያይ ፍቀድለት
  return <>{children}</>;
};

export default ProtectedRoute;