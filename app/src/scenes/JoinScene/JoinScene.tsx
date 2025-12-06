import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useSessionJoin } from "../../hooks/useRefinimentJoin";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPrompt } from "@/components/LoginPrompt";
import {
  Lock,
  Users,
  AlertTriangle,
  XCircle,
  Clock,
  LogIn,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useSessionCode } from "@/hooks/useSessionCode";

const JoinScene: React.FC = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [sessionPassword, setSessionPassword] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isReturningFromLogin, setIsReturningFromLogin] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { sessionCode: joinCode, setSessionCode: setJoinCode, isRestored } = useSessionCode();
  const navigate = useNavigate();

  const {
    isJoining,
    error,
    requiresPassword,
    sessionData,
    joinSession,
    resetPasswordState,
    resetError,
  } = useSessionJoin();

  useEffect(() => {
    if (!authLoading) {
      if (sessionCode) {
        setJoinCode(sessionCode);
        sessionStorage.setItem('pending_session_code', sessionCode);
      }

      const pendingCode = sessionStorage.getItem('pending_session_code');
      const isReturning = sessionStorage.getItem('is_returning_from_login');

      if (pendingCode && !joinCode) {
        setJoinCode(pendingCode);
      }

      if (isReturning === 'true') {
        setIsReturningFromLogin(true);
        sessionStorage.removeItem('is_returning_from_login');

        setTimeout(() => {
          setIsReturningFromLogin(false);
        }, 3000);
      }

      if (user && joinCode && !requiresPassword && !isJoining) {
        const timer = setTimeout(() => {
          handleAutoJoin();
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, sessionCode, user, joinCode, requiresPassword, isJoining]);

  const handleAutoJoin = async () => {
    if (!user || !joinCode || requiresPassword || isJoining) return;

    try {
      const result = await joinSession(joinCode, undefined);

      if (result?.success) {
        sessionStorage.removeItem('pending_session_code');
        navigate(`/team-selection/${result.sessionId}`);
      }
    } catch (err) {
      console.error('Erro no auto-join:', err);
    }
  };

  const handleJoinSession = async () => {
    if (!user) {
      if (joinCode.trim()) {
        sessionStorage.setItem('pending_session_code', joinCode.trim());
      }
      navigate('/name-entry');
      return;
    }

    const password = requiresPassword ? sessionPassword : undefined;
    const result = await joinSession(joinCode, password);

    if (result?.success) {
      sessionStorage.removeItem('pending_session_code');
      navigate(`/team-selection/${result.sessionId}`);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginPrompt(false);

    sessionStorage.setItem('is_returning_from_login', 'true');
  };

  const handleGoBack = () => {
    if (requiresPassword) {
      resetPasswordState();
      setSessionPassword('');
    } else {
      navigate('/');
    }
  };

  const handleQuickJoin = (code: string) => {
    setJoinCode(code);
    resetError();
  };

  const handleInputChange = (value: string) => {
    setJoinCode(value);
    resetError();

    if (value.trim()) {
      sessionStorage.setItem('pending_session_code', value.trim());
    }
  };

  const handlePasswordChange = (value: string) => {
    setSessionPassword(value);
    resetError();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinSession();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header com botão voltar */}
          <div className="relative text-center">
            <Button
              onClick={handleGoBack}
              variant="primary"
              className="flex items-center justify-center gap-2"
              size='sm'
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {requiresPassword ? 'Senha da Sessão' : 'Entrar em uma Sessão'}
            </h1>
            <p className="text-gray-600">
              {requiresPassword
                ? `A sessão "${sessionData?.title}" é protegida por senha`
                : 'Junte-se a uma sessão existente'
              }
            </p>

            {/* Feedback de retorno do login */}
            {isReturningFromLogin && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <p className="text-green-700 text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Login realizado com sucesso! Continue para entrar na sessão.
                </p>
              </div>
            )}
          </div>

          {/* Join Session Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${requiresPassword ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {requiresPassword ? (
                  <Lock className="w-8 h-8 text-yellow-500" />
                ) : (
                  <Users className="w-8 h-8 text-green-500" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {requiresPassword ? 'Sessão Protegida' : 'Participar de uma Sessão'}
              </h3>
              <p className="text-gray-600 text-sm">
                {requiresPassword
                  ? 'Digite a senha para acessar esta sessão'
                  : 'Insira o código da sessão para se juntar a ela'
                }
              </p>

              {!user && !requiresPassword && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Você precisa estar autenticado para entrar na sessão
                  </p>
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              {!requiresPassword ? (
                <div>
                  <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Código da Sessão *
                  </label>
                  <div className="relative">
                    <input
                      id="joinCode"
                      type="text"
                      placeholder="Ex: ABC123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={joinCode}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isJoining || !user}
                      autoFocus={!user}
                    />
                    {/* Indicador de código salvo */}
                    {sessionStorage.getItem('pending_session_code') === joinCode && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  {joinCode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Código da sessão: <span className="font-semibold">{joinCode}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="sessionPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha da Sessão *
                  </label>
                  <input
                    id="sessionPassword"
                    type="password"
                    placeholder="Digite a senha da sessão"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={sessionPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isJoining}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-fade-in">
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {isJoining && (
                <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="blue" className="mr-2" />
                    {requiresPassword ? 'Verificando senha...' : 'Entrando na sessão...'}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={handleGoBack}
                  disabled={isJoining}
                  variant="secondary"
                  className="flex-1"
                >
                  {requiresPassword ? 'Voltar ao Código' : 'Voltar'}
                </Button>
                <Button
                  onClick={handleJoinSession}
                  disabled={
                    !joinCode.trim() ||
                    (requiresPassword && !sessionPassword.trim()) ||
                    isJoining ||
                    (!user && !requiresPassword)
                  }
                  loading={isJoining}
                  variant={requiresPassword ? "primary" : "primary"}
                  className={`flex-1 ${requiresPassword ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {!user && !requiresPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Fazer Login
                    </span>
                  ) : requiresPassword ? (
                    'Verificar Senha'
                  ) : (
                    'Participar'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Join Options */}
          {!requiresPassword && !isJoining && user && (
            <div className="text-center animate-fade-in">
              <p className="text-gray-500 text-sm mb-3">Sessões recentes:</p>
              <div className="flex justify-center space-x-2">
                {['TEAM123', 'PROJ456', 'RETRO789'].map((code) => (
                  <button
                    key={code}
                    onClick={() => handleQuickJoin(code)}
                    disabled={isJoining}
                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              * Campo obrigatório
            </p>
            {isJoining && (
              <p className="text-blue-500 text-sm mt-2 animate-pulse flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Isso pode levar alguns segundos...
              </p>
            )}
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <LoginPrompt
          onLoginSuccess={handleLoginSuccess}
          message={`Para entrar na sessão "${joinCode || sessionCode}", faça login ou crie uma conta.`}
        />
      )}
    </>
  );
};

export default JoinScene;