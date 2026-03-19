import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { PlusCircle, Users } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const HomeScene: React.FC = () => {
  const { t } = useLanguage();
  const { user, anonymousUser, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const navigate = useNavigate();

  const handleCreateScene = () => {
    navigate('/session-creation');
  };

  const handleJoinScene = () => {
    navigate(`/join-a-session`);
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCreateScene();
    }
  };

  const handleJoinKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleJoinScene();
    }
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
            {t('home:welcome', { name: user?.displayName })}
          </h1>
          <p className="text-gray-600">
            {t('home:subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Create Session Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleCreateScene}
            onKeyDown={handleCreateKeyDown}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={t('home:createAriaLabel')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-8 h-8 text-blue-500" />

              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('home:createTitle')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('home:createDescription')}
              </p>
            </div>
          </div>

          {/* Join Session Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleJoinScene}
            onKeyDown={handleJoinKeyDown}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={t('home:joinAriaLabel')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('home:joinTitle')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('home:joinDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScene;