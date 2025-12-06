import { AuthForm } from '@/components/AuthForm';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterScene: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp, signInWithGoogle } = useAuth();
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
      if (!data.displayName) {
        throw new Error('Nome é obrigatório');
      }

      await signUp(data.email, data.password, data.displayName);
      toast.success('Conta criada com sucesso!');

      const pendingSessionCode = sessionStorage.getItem('pending_session_code');
      if (pendingSessionCode) {
        navigate(`/join-a-session/${pendingSessionCode}`);
        sessionStorage.removeItem('pending_session_code');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao criar conta';
      setError(errorMsg);

      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email já está em uso.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Senha muito fraca. Use pelo menos 6 caracteres com letras maiúsculas e números.');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }

      throw error;
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
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao fazer login com Google';
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
                navigate('/login');
              }
            }}
            message="Preencha os dados para se cadastrar"
            showBackButton={true}
            onBack={handleGoBack}
            backButtonLabel="Voltar"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterScene;