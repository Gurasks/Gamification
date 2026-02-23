import { AuthForm } from '@/components/AuthForm';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';

const RegisterScene: React.FC = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pendingCode = sessionStorage.getItem('register_redirect_code') ||
      sessionStorage.getItem('pending_session_code');

    if (pendingCode && !joinCode) {
      setJoinCode(pendingCode);
    }
  }, []);

  const handleSubmit = async (data: {
    email: string;
    password: string;
    displayName?: string;
    confirmPassword?: string;
  }) => {
    setError('');
    setIsLoading(true);

    try {
      if (!data.displayName) {
        throw new Error(t('auth.nameRequired'));
      }

      await signUp(data.email, data.password, data.displayName);
      toast.success(t('auth.registerSuccess'));

      const pendingSessionCode = sessionStorage.getItem('pending_session_code') ||
        sessionStorage.getItem('register_redirect_code');

      if (pendingSessionCode) {
        navigate(`/join-a-session/${pendingSessionCode}`);
        sessionStorage.removeItem('pending_session_code');
        sessionStorage.removeItem('register_redirect_code');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const errorMsg = getFirebaseErrorMessage(error, t);
      setError(errorMsg);
      toast.error(errorMsg);
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

      const pendingSessionCode = sessionStorage.getItem('pending_session_code') ||
        sessionStorage.getItem('register_redirect_code');

      if (pendingSessionCode) {
        navigate(`/join-a-session/${pendingSessionCode}`);
        sessionStorage.removeItem('pending_session_code');
        sessionStorage.removeItem('register_redirect_code');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const errorMsg = getFirebaseErrorMessage(error, t);
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
      <div className="max-w-md w-full">
        {/* Registration Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <AuthForm
            mode="register"
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleSignIn}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            error={error}
            onModeChange={(mode) => {
              if (mode === 'login') {
                if (joinCode) {
                  sessionStorage.setItem('login_redirect_code', joinCode);
                }
                navigate('/login');
              }
            }}
            message={t('auth.registerMessage')}
            onBack={handleGoBack}
            backButtonLabel={t('common.back')}
            showBackButton={true}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterScene;