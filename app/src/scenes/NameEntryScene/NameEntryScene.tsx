import {
  AlertCircle,
  LogIn,
  LogOut,
  ShieldAlert,
  User,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';

const NameEntryScene: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signInAnonymously, updateUserProfile, user, anonymousUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleAnonymousSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('login:errors.nameRequired'));
      return;
    }

    if (name.trim().length < 2) {
      toast.error(t('login:errors.minLength'));
      return;
    }

    setIsLoading(true);

    try {
      if (!user) {
        await signInAnonymously(name.trim());
        toast.success(t('login:success.welcome', { name: name.trim() }));
      } else if (anonymousUser) {
        await updateUserProfile(name.trim());
        toast.success(t('login:success.nameUpdated', { name: name.trim() }));
      }

      const pendingSessionCode = sessionStorage.getItem('pending_session_code');
      const redirectPath = sessionStorage.getItem('redirect_path');

      setTimeout(() => {
        if (pendingSessionCode) {
          sessionStorage.removeItem('pending_session_code');
          sessionStorage.removeItem('redirect_path');
          navigate(`/join-a-session/${pendingSessionCode}`);
        } else if (redirectPath && redirectPath !== '/name-entry') {
          sessionStorage.removeItem('redirect_path');
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      }, 300);

    } catch (error: any) {
      console.error('Erro ao configurar usuário:', error);

      if (error.code === 'auth/network-request-failed') {
        toast.error(t('login:errors.networkError'));
      } else if (error.code === 'auth/too-many-requests') {
        toast.error(t('login:errors.tooManyRequests'));
      } else {
        toast.error(t('login:errors.genericError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('login:success.logout'));
      sessionStorage.removeItem('pending_session_code');
      sessionStorage.removeItem('redirect_path');
      sessionStorage.removeItem('redirect_after_name');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error(t('login:errors.logoutError'));
    }
  };

  const handleLoginClick = () => {
    const pendingSessionCode = sessionStorage.getItem('pending_session_code');
    if (pendingSessionCode) {
      sessionStorage.setItem('login_redirect_code', pendingSessionCode);
    }

    const redirectPath = sessionStorage.getItem('redirect_path');
    if (redirectPath) {
      sessionStorage.setItem('login_redirect_path', redirectPath);
    }

    navigate('/login');
  };

  const handleRegisterClick = () => {
    const pendingSessionCode = sessionStorage.getItem('pending_session_code');
    if (pendingSessionCode) {
      sessionStorage.setItem('register_redirect_code', pendingSessionCode);
    }

    navigate('/register');
  };

  useEffect(() => {
    if (user && !anonymousUser) {
      const pendingSessionCode = sessionStorage.getItem('pending_session_code');
      const redirectPath = sessionStorage.getItem('redirect_path');

      if (pendingSessionCode) {
        sessionStorage.removeItem('pending_session_code');
        sessionStorage.removeItem('redirect_path');
        navigate(`/join-a-session/${pendingSessionCode}`);
      } else if (redirectPath) {
        sessionStorage.removeItem('redirect_path');
        navigate(redirectPath);
      } else if (window.location.pathname === '/name-entry') {
        navigate('/');
      }
    }
  }, [user, anonymousUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {user ? t('login:titles.update') : t('login:titles.welcome')}
          </h1>
          <p className="text-gray-600">
            {user
              ? t('login:subtitles.update')
              : t('login:subtitles.welcome')
            }
          </p>
        </div>

        {/* Name Entry Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {user ? (
                <User className="w-8 h-8 text-blue-500" />
              ) : (
                <Users className="w-8 h-8 text-green-500" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {user ? t('login:titles.changeName') : t('login:titles.identification')}
            </h3>
            <p className="text-gray-600 text-sm">
              {user
                ? t('login:descriptions.changeName')
                : t('login:descriptions.identification')
              }
            </p>
          </div>

          {/* Anonymous Form */}
          <form onSubmit={handleAnonymousSubmit} className="space-y-4" data-testid="name-entry-form">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <User className="w-4 h-4" />
                {t('login:labels.yourName')} *
              </label>
              <input
                type="text"
                id="name"
                placeholder={t('login:placeholders.name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                minLength={2}
                maxLength={50}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>{t('validation:minLength', { field: t('login:labels.yourName'), count: 2 })}</span>
                <span>{name.length}/50</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                loading={isLoading}
                disabled={!name.trim() || name.trim().length < 2}
                className="w-full flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                {user ? t('login:buttons.saveName') : t('login:buttons.continueAsGuest')}
              </Button>

              {anonymousUser && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('login:buttons.logout')}
                </Button>
              )}
            </div>
          </form>

          {/*Divider for login */}
          {!user && (
            <>
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-sm text-gray-500">{t('auth:or')}</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Login Options */}
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleLoginClick}
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 capitalize"
                >
                  <LogIn className="w-4 h-4" />
                  {t('auth:login')}
                </Button>

                <Button
                  type="button"
                  onClick={handleRegisterClick}
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 capitalize"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('auth:register')}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-2">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {t('login:info.visibility')}
          </p>
          {anonymousUser && (
            <p className="text-yellow-600 text-sm flex items-center justify-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              {t('login:info.anonymousMode')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NameEntryScene;