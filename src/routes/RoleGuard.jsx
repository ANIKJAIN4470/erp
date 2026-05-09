import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleGuard = ({ children, allowedRoles }) => {
  const { user, role, userType, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="shimmer" style={{ height: '100vh' }}></div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user type matches the route
  if (location.pathname.startsWith('/admin') && userType !== 'admin') {
    return <Navigate to="/employee/dashboard" replace />;
  }
  
  if (location.pathname.startsWith('/employee') && userType !== 'employee') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check role-based permissions
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on user type
    if (userType === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { user, loading, userType } = useAuth();
  
  if (loading) return null;
  
  if (user) {
    // Redirect to appropriate dashboard based on user type
    if (userType === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};
