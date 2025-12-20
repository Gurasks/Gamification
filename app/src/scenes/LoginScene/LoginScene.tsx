import { AuthForm } from '@/components/AuthForm';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/Button';

const LoginScene: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

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
      toast.success('Login realizado com sucesso!');

      const pendingSessionCode = sessionStorage.getItem('pending_session_code');
      if (pendingSessionCode) {
        navigate(`/join-a-session/${pendingSessionCode}`);
        sessionStorage.removeItem('pending_session_code');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao fazer login';
      setError(errorMsg);

      if (err.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado.');
      } else if (err.code === 'auth/wrong-password') {
        toast.error('Senha incorreta.');
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }

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
        toast.success('Conta criada com Google!');
      } else {
        toast.success('Login realizado com Google!');
      }

      const pendingSessionCode = sessionStorage.getItem('pending_session_code');
      if (pendingSessionCode) {
        navigate(`/join-a-session/${pendingSessionCode}`);
        sessionStorage.removeItem('pending_session_code');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao fazer login com Google';
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
            message="Entre com sua conta para acessar as sessões"
            onBack={handleGoBack}
            backButtonLabel="Voltar"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginScene;