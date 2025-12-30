import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface RouteGuardProps {
  children: React.ReactNode;
}

const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    '/login',
    '/register',
    '/name-entry'
  ];

  return publicRoutes.includes(pathname) ||
    pathname.startsWith('/join-a-session');
};

const isJoinSessionRoute = (pathname: string): boolean => {
  return pathname.startsWith('/join-a-session');
};

const extractSessionCodeFromPath = (pathname: string): string | null => {
  const match = pathname.match(/\/join-a-session\/([^/]+)/);
  return match ? match[1] : null;
};

const hasValidDisplayName = (displayName: string | null | undefined): boolean => {
  if (!displayName) return false;

  const trimmedName = displayName.trim();
  if (trimmedName.length < 2) return false;

  const invalidNames = [
    'Convidado',
    'Anonymous',
    'Anônimo',
    'Usuário',
    'Usuário Anônimo'
  ];

  return !invalidNames.includes(trimmedName);
};

const shouldRedirectToNameEntry = (
  user: User | null,
  anonymousUser: boolean,
  pathname: string,
): boolean => {
  // Se não há usuário e não é rota pública, redirecionar
  if (!user && !isPublicRoute(pathname)) {
    return true;
  }

  // Se é rota de join-session sem usuário, redirecionar
  if (isJoinSessionRoute(pathname) && !user) {
    return true;
  }

  // Se é usuário anônimo sem nome válido e não está na página de name-entry, redirecionar
  if (user && anonymousUser && !hasValidDisplayName(user.displayName) && pathname !== '/name-entry') {
    return true;
  }

  return false;
};

const saveRedirectPath = (pathname: string, search: string): void => {
  const fullPath = pathname + search;

  if (!isJoinSessionRoute(pathname) || !extractSessionCodeFromPath(pathname)) {
    sessionStorage.setItem('redirect_path', fullPath);
  }
};

const handleJoinSessionRedirect = (
  pathname: string,
  user: User | null,
  navigate: (path: string) => void
): boolean => {
  if (!isJoinSessionRoute(pathname) || user) return false;

  const sessionCode = extractSessionCodeFromPath(pathname);
  if (!sessionCode) return false;

  sessionStorage.setItem('pending_session_code', sessionCode);

  if (pathname !== '/name-entry') {
    navigate('/name-entry');
    return true;
  }

  return false;
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
      <p className="mt-4 text-gray-600">Carregando...</p>
    </div>
  </div>
);

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, anonymousUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const { pathname, search } = location;

    // Primeiro, tratar redirecionamento específico para join-session
    const didRedirectForJoinSession = handleJoinSessionRedirect(pathname, user, navigate);
    if (didRedirectForJoinSession) return;

    // Depois, verificar se precisa redirecionar para name-entry
    const shouldRedirect = shouldRedirectToNameEntry(user, anonymousUser, pathname);

    if (shouldRedirect && pathname !== '/name-entry') {
      saveRedirectPath(pathname, search);
      navigate('/name-entry');
      return;
    }

  }, [user, anonymousUser, loading, navigate, location]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default RouteGuard;