import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, anonymousUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = new Set(['/login', '/register', '/name-entry']);

  useEffect(() => {
    if (!loading && user && anonymousUser) {
      const hasValidName = user.displayName &&
        user.displayName.length >= 2 &&
        user.displayName !== 'Convidado';

      if (!hasValidName && !publicRoutes.has(location.pathname)) {
        navigate('/name-entry');
      }
    }
  }, [user, anonymousUser, loading, navigate, location]);

  return <>{children}</>;
};

export default RouteGuard;