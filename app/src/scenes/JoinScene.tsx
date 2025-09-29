import { useState } from "react";
import { useUser } from "../components/UserContext";
import { useNavigate } from "react-router-dom";
import { resolveUUID, updateDocumentListMembers, getRefinement } from "../services/firestoreService";
import { handleReponse } from "../services/homeServices";

const JoinScene: React.FC = () => {
  const { user } = useUser();
  const [joinCode, setJoinCode] = useState('');
  const [sessionPassword, setSessionPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [refinementData, setRefinementData] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoinSession = async () => {
    if (!joinCode.trim()) return;

    setIsJoining(true);
    setError('');

    try {
      const refinementId = await resolveUUID(joinCode.trim());

      if (refinementId) {
        // Buscar dados da sessão diretamente usando getRefinement
        const session = await getRefinement(refinementId);

        if (session) {
          setRefinementData(session); // Atualiza o estado para uso futuro

          if (session.requiresPassword && !sessionPassword) {
            // Sessão requer senha mas nenhuma foi fornecida ainda
            setRequiresPassword(true);
            setIsJoining(false);
            return;
          }

          if (session.requiresPassword && sessionPassword !== session.password) {
            setError('Senha incorreta');
            setIsJoining(false);
            return;
          }

          // Senha correta ou sessão não requer senha
          const response = await updateDocumentListMembers(refinementId, user);
          const redirection = handleReponse(response);
          if (redirection) {
            navigate(`/team-selection/${refinementId}`);
          } else {
            setError('Não foi possível entrar na sessão');
            setIsJoining(false);
          }
        } else {
          setError('Sessão não encontrada');
          setIsJoining(false);
        }
      } else {
        setError('Código inválido');
        setIsJoining(false);
      }
    } catch (error) {
      console.error('Erro ao entrar na sessão:', error);
      setError('Erro ao entrar na sessão');
      setIsJoining(false);
    }
  };

  const handleGoBack = () => {
    if (requiresPassword) {
      // Volta para a tela de código
      setRequiresPassword(false);
      setSessionPassword('');
      setError('');
    } else {
      navigate('/');
    }
  };

  const handleQuickJoin = (code: string) => {
    setJoinCode(code);
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  value={sessionPassword}
                  onChange={(e) => setSessionPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleGoBack}
                disabled={isJoining}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requiresPassword ? 'Voltar ao Código' : 'Voltar'}
              </button>
              <button
                onClick={handleJoinSession}
                disabled={
                  !joinCode.trim() ||
                  (requiresPassword && !sessionPassword.trim()) ||
                  isJoining
                }
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${!joinCode.trim() ||
                  (requiresPassword && !sessionPassword.trim()) ||
                  isJoining
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : requiresPassword
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-105'
                    : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                  }`}
              >
                {isJoining ? 'Entrando...' : requiresPassword ? 'Verificar Senha' : 'Participar'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Join Options (só mostra na tela de código) */}
        {!requiresPassword && (
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-3">Sessões recentes:</p>
            <div className="flex justify-center space-x-2">
              {['TEAM123', 'PROJ456', 'RETRO789'].map((code) => (
                <button
                  key={code}
                  onClick={() => handleQuickJoin(code)}
                  className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
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
        </div>
      </div>
    </div>
  );
};

export default JoinScene;