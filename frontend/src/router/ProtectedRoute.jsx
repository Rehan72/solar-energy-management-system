import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isTokenExpired, logout, getUserRole } from '../lib/auth';
import { notify } from '../lib/toast';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check if token exists and is not expired
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuth(false);
        setLoading(false);
        return;
      }

      // Check token expiration
      if (isTokenExpired()) {
        // Token expired - logout and redirect
        notify.warning('Your session has expired. Please login again.');
        logout();
        setIsAuth(false);
        setLoading(false);
        return;
      }

      setIsAuth(isAuthenticated());
      setUserRole(getUserRole());
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-solar-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuth) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to dashboard if user doesn't have required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
