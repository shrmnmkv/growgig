import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Redirect based on user role
  if (user?.role === 'freelancer') {
    return <Navigate to="/freelancer-dashboard" />;
  } else if (user?.role === 'employer') {
    return <Navigate to="/employer-dashboard" />;
  }
  
  // Fallback (should never reach here)
  return <Navigate to="/" />;
};

export default Dashboard;
