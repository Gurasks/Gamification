import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, anonymousUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const pathname = location.pathname;
    const search = location.search;

    const isPublicRoute =
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/name-entry' ||
      pathname.startsWith('/join-a-session');

    if (pathname.startsWith('/join-a-session')) {
      const sessionMatch = pathname.match(/\/join-a-session\/([^/]+)/);
      if (sessionMatch && !user) {
        sessionStorage.setItem('pending_session_code', sessionMatch[1]);

        if (pathname !== '/name-entry') {
          if (!pathname.includes('/join-a-session/')) {
            sessionStorage.setItem('redirect_path', pathname + search);
          }
          navigate('/name-entry');
        }
        return;
      }
    }

    if (!user && !isPublicRoute) {
      if (!pathname.startsWith('/join-a-session')) {
        sessionStorage.setItem('redirect_path', pathname + search);
      }
      navigate('/name-entry');
      return;
    }

    if (user && anonymousUser) {
      const hasValidName = user.displayName &&
        user.displayName.trim().length >= 2 &&
        !['Convidado', 'Anonymous', 'Anônimo', 'Usuário', 'Usuário Anônimo'].includes(user.displayName.trim());

      if (!hasValidName && pathname !== '/name-entry') {
        if (!sessionStorage.getItem('redirect_path')) {
          sessionStorage.setItem('redirect_path', pathname + search);
        }
        navigate('/name-entry');
        return;
      }
    }

  }, [user, anonymousUser, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;