import { LoginPrompt } from '@/components/LoginPrompt';
import {
  AlertCircle,
  LogIn,
  LogOut,
  ShieldAlert,
  User,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

const NameEntryScene: React.FC = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { signInAnonymously, updateUserProfile, user, anonymousUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleAnonymousSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Por favor, digite seu nome');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      if (!user) {
        await signInAnonymously(name.trim());
        toast.success(`Bem-vindo, ${name.trim()}!`);
      } else if (anonymousUser) {
        await updateUserProfile(name.trim());
        toast.success(`Nome atualizado para ${name.trim()}!`);
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
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Muitas tentativas. Tente novamente em alguns minutos.');
      } else {
        toast.error('Erro ao configurar usuário. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginPrompt(false);

    sessionStorage.setItem('is_returning_from_login', 'true');

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
    }, 500);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sessão encerrada');
      sessionStorage.removeItem('pending_session_code');
      sessionStorage.removeItem('redirect_path');
      sessionStorage.removeItem('redirect_after_name');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao sair');
    }
  };

  const openLoginPrompt = () => {
    setShowLoginPrompt(true);
  };

  React.useEffect(() => {
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {user ? 'Configurar Nome' : 'Bem-vindo!'}
            </h1>
            <p className="text-gray-600">
              {user
                ? 'Escolha como deseja ser identificado'
                : 'Identifique-se para participar das sessões'
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
                {user ? 'Alterar Nome' : 'Identificação'}
              </h3>
              <p className="text-gray-600 text-sm">
                {user
                  ? 'Escolha um nome para ser identificado nas sessões'
                  : 'Digite seu nome para continuar'
                }
              </p>
            </div>

            {/* Formulário para login anônimo */}
            <form onSubmit={handleAnonymousSubmit} className="space-y-4" data-testid="name-entry-form">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Seu Nome *
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Ex: João Silva"
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
                  <span>Mínimo 2 caracteres</span>
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
                  {user ? 'Salvar Nome' : 'Continuar como Anônimo'}
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
                    Sair e Fazer Login
                  </Button>
                )}
              </div>
            </form>

            {/* Divisor para opções de login */}
            {!user && (
              <>
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-sm text-gray-500">ou</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Opções de login com conta */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={openLoginPrompt}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Fazer Login com Email
                  </Button>

                  <Button
                    type="button"
                    onClick={() => navigate('/register')}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Criar Conta
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Seu nome será visível para outros participantes da sessão
            </p>
            {anonymousUser && (
              <p className="text-yellow-600 text-sm flex items-center justify-center gap-1">
                <ShieldAlert className="w-4 h-4" />
                Modo anônimo - seus dados serão perdidos ao sair
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPrompt
          onLoginSuccess={handleLoginSuccess}
          message="Faça login com sua conta para continuar"
          showBackButton={true}
          onBack={() => {
            setShowLoginPrompt(false);
            setTimeout(() => {
              document.getElementById('name-input')?.focus();
            }, 100);
          }}
          initialMode="login"
        />
      )}
    </>
  );
};

export default NameEntryScene;