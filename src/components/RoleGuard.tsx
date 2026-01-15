import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { PermissionDenied } from './ui/PermissionDenied';


interface RoleGuardProps {
  allow: string[]; // e.g. ['inspector', 'admin']
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allow, children }) => {
  const { user, loading } = useSession();
  const location = useLocation();
  const isAuthenticated = !!user;

  if (loading) {
    return null; // or a spinner if you prefer
  }

  // Check for demo session
  const demoSession = localStorage.getItem('demo-session');
  if (demoSession) {
    return <>{children}</>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user.role || 'user';

  if (!allow.includes(role)) {
    // Show permission denied screen instead of silent redirect
    return <PermissionDenied />;
  }

  return <>{children}</>;
};

export default RoleGuard;
