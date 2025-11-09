import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';

const HomeScene: React.FC = () => {
  const { user, anonymousUser, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const navigate = useNavigate();

  const handleCreateScene = () => {
    navigate('/session-creation');
  };

  const handleJoinScene = () => {
    navigate(`/join-a-session`);
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!loading) {
        const hasValidUser = user?.uid;
        const hasValidName = user?.displayName &&
          user.displayName.length >= 2 &&
          user.displayName !== 'Convidado';

        if (!hasValidUser || (anonymousUser && !hasValidName)) {
          navigate('/name-entry');
        } else {
          setCheckingProfile(false);
        }
      }
    };

    checkAccess();
  }, [user, anonymousUser, loading, navigate]);

  if (loading || checkingProfile) {
    return (
      <LoadingOverlay />
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Bem vindo {user?.displayName} ao gamification!
          </h1>
          <p className="text-gray-600">
            Colabore e jogue com sua equipe em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Create Session Card */}
          <div
            onClick={handleCreateScene}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Crie uma nova sessão
              </h3>
              <p className="text-gray-600 text-sm">
                Comece uma nova sessão e convide a sua equipe
              </p>
            </div>
          </div>

          <div
            onClick={handleJoinScene}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Junte-se a uma sessão
              </h3>
              <p className="text-gray-600 text-sm">
                Escolha uma sessão para participar ou entre com um código
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScene;