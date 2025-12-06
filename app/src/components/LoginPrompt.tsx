import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { AuthForm, AuthMode } from './AuthForm';

interface LoginPromptProps {
  onLoginSuccess: () => void;
  message?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  initialMode?: AuthMode;
}

export const LoginPrompt: React.FC<LoginPromptProps> = ({
  onLoginSuccess,
  message = "Para continuar, faça login ou crie uma conta.",
  showBackButton = false,
  onBack,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (data: {
    email: string;
    password: string;
    displayName?: string;
    confirmPassword?: string;
  }) => {
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(data.email, data.password);
        toast.success('Login realizado com sucesso!');
      } else {
        if (!data.displayName) {
          throw new Error('Nome é obrigatório');
        }
        await signUp(data.email, data.password, data.displayName);
        toast.success('Conta criada com sucesso!');
      }

      sessionStorage.setItem('is_returning_from_login', 'true');

      setTimeout(() => {
        onLoginSuccess();
      }, 300);
    } catch (err: any) {
      const errorMsg = err.message || `Erro ao ${mode === 'login' ? 'fazer login' : 'criar conta'}`;
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        toast.success('Login com Google realizado com sucesso!');

        sessionStorage.setItem('is_returning_from_login', 'true');

        setTimeout(() => {
          onLoginSuccess();
        }, 300);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao fazer login com Google';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Auth Form */}
        <div className="p-6">
          <AuthForm
            mode={mode}
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            error={error}
            onModeChange={handleModeChange}
            message={message}
            showBackButton={showBackButton}
            onBack={onBack}
            backButtonLabel="Voltar"
          />
        </div>
      </div>
    </div>
  );
};