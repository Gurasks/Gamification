import { AuthForm } from '@/components/AuthForm';
import { useLanguage } from '@/hooks/useLanguage';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

const LoginScene: React.FC = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pendingCode = sessionStorage.getItem('pending_session_code') ||
      sessionStorage.getItem('login_redirect_code');

    if (pendingCode && !joinCode) {
      setJoinCode(pendingCode);
    }
  }, [joinCode]);

  const pendingCode = sessionStorage.getItem('login_redirect_code') ||
    sessionStorage.getItem('pending_session_code');

  if (pendingCode) {
    navigate(`/join-a-session/${pendingCode}`);
    sessionStorage.removeItem('login_redirect_code');
    sessionStorage.removeItem('pending_session_code');
  }

  const handleSubmit = async (data: {
    email: string;
    password: string;
    displayName?: string;
    confirmPassword?: string;
  }) => {
    setError('');
    setIsLoading(true);

    try {
      await signIn(data.email, data.password);
      toast.success(t('auth.messages.loginSuccess'));

      const pendingSessionCode = sessionStorage.getItem('pending_session_code');
      if (pendingSessionCode) {
        navigate(`/join-a-session/${pendingSessionCode}`);
        sessionStorage.removeItem('pending_session_code');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errorMsg = getFirebaseErrorMessage(err, t);
      setError(errorMsg);
      toast.error(errorMsg);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.isNewUser) {
        toast.success(t('auth.googleSignUpSuccess'));
      } else {
        toast.success(t('auth.googleLoginSuccess'));
      }

      const pendingSessionCode = sessionStorage.getItem('pending_session_code');
      if (pendingSessionCode) {
        navigate(`/join-a-session/${pendingSessionCode}`);
        sessionStorage.removeItem('pending_session_code');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errorMsg = err.message || t('auth.googleError');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <AuthForm
            mode="login"
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleSignIn}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            error={error}
            onModeChange={(mode) => {
              if (mode === 'register') {
                navigate('/register');
              }
            }}
            message={t('auth.messages.loginMessage')}
            onBack={handleGoBack}
            backButtonLabel={t('common.actions.back')}
            showBackButton={true}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginScene;