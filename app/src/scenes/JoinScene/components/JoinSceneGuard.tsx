import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const JoinSceneGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !sessionCode) return;

    if (sessionCode && !user) {
      sessionStorage.setItem('pending_session_code', sessionCode);
      navigate('/name-entry');
    }
  }, [user, loading, sessionCode, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};