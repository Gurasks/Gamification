import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useRefinementJoin } from "../hooks/useRefinimentJoin";

const JoinScene: React.FC = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [joinCode, setJoinCode] = useState(sessionCode || '');
  const [sessionPassword, setSessionPassword] = useState('');

  const {
    isJoining,
    error,
    requiresPassword,
    refinementData,
    joinSession,
    resetPasswordState,
    resetError,
  } = useRefinementJoin();

  const navigate = useNavigate();

  const handleJoinSession = async () => {
    const password = requiresPassword ? sessionPassword : undefined;
    const result = await joinSession(joinCode, password);

    if (result?.success) {
      navigate(`/team-selection/${result.refinementId}`);
    } else if (result?.requiresPassword) {
      // Mantém o estado de requiresPassword true e aguarda a senha
      return;
    }
  };

  const handleGoBack = () => {
    if (requiresPassword) {
      // Volta para a tela de código
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {requiresPassword ? 'Senha da Sessão' : 'Entrar em uma Sessão'}
          </h1>
          <p className="text-gray-600">
            {requiresPassword
              ? `A sessão "${refinementData?.title}" é protegida por senha`
              : 'Junte-se a uma sessão de refinamento existente'
            }
          </p>
        </div>

        {/* Join Session Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${requiresPassword ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {requiresPassword ? (
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {requiresPassword ? 'Sessão Protegida' : 'Participar de uma Sessão'}
            </h3>
            <p className="text-gray-600 text-sm">
              {requiresPassword
                ? 'Digite a senha para acessar esta sessão'
                : 'Insira o código da sessão para se juntar ao refinamento'
              }
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            {!requiresPassword ? (
              // Tela de código
              <div>
                <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Código da Sessão *
                </label>
                <input
                  id="joinCode"
                  type="text"
                  placeholder="Ex: ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={joinCode}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isJoining}
                />
              </div>
            ) : (
              // Tela de senha
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
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Loading Indicator durante o processo */}
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
                  isJoining
                }
                loading={isJoining}
                variant={requiresPassword ? "primary" : "primary"}
                className={`flex-1 ${requiresPassword ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {requiresPassword ? 'Verificar Senha' : 'Participar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Join Options (só mostra na tela de código) */}
        {!requiresPassword && !isJoining && (
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
            <p className="text-blue-500 text-sm mt-2 animate-pulse">
              Isso pode levar alguns segundos...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinScene;