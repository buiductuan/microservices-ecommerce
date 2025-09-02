import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Replace this with your actual auth logic (Redux, context, etc.)
function isAuthenticated() {
  // Example: check for a token in localStorage
  return Boolean(localStorage.getItem('token'));
}

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
