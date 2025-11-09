import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';
import { auth } from '@/config/firebase';

const NameEntryScene: React.FC = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signInAnonymously, updateUserProfile, user, anonymousUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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

      await new Promise(resolve => setTimeout(resolve, 100));

      const currentAuth = auth.currentUser;

      if (currentAuth?.displayName === name.trim()) {
        navigate('/');
      } else {
        console.warn('DisplayName não foi atualizado corretamente, tentando novamente...');
        await currentAuth?.reload();
        navigate('/');
      }

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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sessão encerrada');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao sair');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {user ? 'Configurar Nome' : 'Bem-vindo ao Gamification!'}
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
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {user ? 'Alterar Nome' : 'Identificação Obrigatória'}
            </h3>
            <p className="text-gray-600 text-sm">
              {user
                ? 'Escolha um nome para ser identificado nas sessões'
                : 'Digite seu nome para continuar como convidado'
              }
            </p>
          </div>

          {/* Input Section */}
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="name-entry-form">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full"
              >
                {user ? 'Salvar Nome' : 'Continuar'}
              </Button>

              {/* Botão de logout apenas para usuários anônimos */}
              {anonymousUser && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full"
                >
                  Sair e Fazer Login
                </Button>
              )}
            </div>
          </form>

          {/* Login Options - apenas se não tem usuário */}
          {!user && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm mb-4">
                Ou faça login com sua conta
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="text-sm"
                >
                  Fazer Login
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/register')}
                  className="text-sm"
                >
                  Cadastrar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            * Seu nome será visível para outros participantes da sessão
          </p>
          {anonymousUser && (
            <p className="text-yellow-600 text-sm mt-2">
              ⚠️ Modo anônimo - seus dados serão perdidos ao sair
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NameEntryScene;