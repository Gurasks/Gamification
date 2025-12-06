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

      // Verificar se tem sessão pendente
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

      // Verificar sessão pendente
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
        {/* Header com botão voltar */}
        <div className="relative text-center">
          <Button
            onClick={handleGoBack}
            variant="primary"
            className="flex items-center justify-center gap-2"
            disabled={isLoading || isGoogleLoading}
            size='sm'
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Fazer Login
          </h1>
          <p className="text-gray-600">
            Acesse sua conta para continuar
          </p>
        </div>

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
            showBackButton={true}
            onBack={handleGoBack}
            backButtonLabel="Voltar"
          />

          {/* Register Link (alternativa) */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScene;