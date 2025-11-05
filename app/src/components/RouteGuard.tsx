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

  // Rotas que não precisam de verificação
  const publicRoutes = ['/login', '/register', '/name-entry'];

  useEffect(() => {
    if (!loading && user && anonymousUser) {
      // Verificar se usuário anônimo tem nome válido
      const hasValidName = user.displayName &&
        user.displayName.length >= 2 &&
        user.displayName !== 'Convidado';

      if (!hasValidName && !publicRoutes.includes(location.pathname)) {
        navigate('/name-entry');
      }
    }
  }, [user, anonymousUser, loading, navigate, location]);

  return <>{children}</>;
};

export default RouteGuard;