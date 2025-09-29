import { useState } from "react";
import { useUser } from "../components/UserContext";
import { useNavigate } from "react-router-dom";
import { createRefinementInFirestore, shortenUUID } from "../services/firestoreService";
import { v4 as uuidv4 } from 'uuid';

const CreationScene: React.FC = () => {
  const { user } = useUser();
  const [newRefinementName, setNewRefinementName] = useState('');
  const [refinementDescription, setRefinementDescription] = useState('');
  const [sessionPassword, setSessionPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateRefinement = async () => {
    if (!newRefinementName.trim() || (requiresPassword && !sessionPassword.trim())) {
      return;
    }

    setIsCreating(true);

    try {
      const newRefinementId = uuidv4();
      await shortenUUID(newRefinementId);

      const refinementData = {
        name: newRefinementName,
        description: refinementDescription,
        password: requiresPassword ? sessionPassword : null,
        requiresPassword: requiresPassword
      };

      const docId = await createRefinementInFirestore(newRefinementId, refinementData, user);
      if (!docId) {
        console.error('Failed to create refinement');
        setIsCreating(false);
        return;
      }
      navigate(`/team-selection/${newRefinementId}`);
    } catch (error) {
      console.error('Error creating refinement:', error);
      setIsCreating(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const togglePasswordProtection = () => {
    const newValue = !requiresPassword;
    setRequiresPassword(newValue);
    // Limpa a senha quando desativar a proteção
    if (!newValue) {
      setSessionPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Criar Nova Sessão
          </h1>
          <p className="text-gray-600">
            Configure uma nova sessão de refinamento para sua equipe
          </p>
        </div>

        {/* Create Session Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nova Sessão de Refinamento
            </h3>
            <p className="text-gray-600 text-sm">
              Configure os detalhes da sua sessão
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            {/* Nome da Sessão */}
            <div>
              <label htmlFor="refinementName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Sessão *
              </label>
              <input
                id="refinementName"
                type="text"
                placeholder="Ex: Sprint 15 - Refinamento de Histórias"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={newRefinementName}
                onChange={(e) => setNewRefinementName(e.target.value)}
              />
            </div>

            {/* Descrição do Refinamento */}
            <div>
              <label htmlFor="refinementDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do que será refinado
              </label>
              <textarea
                id="refinementDescription"
                placeholder="Descreva o objetivo desta sessão, quais histórias serão refinadas, critérios de aceitação, etc."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                value={refinementDescription}
                onChange={(e) => setRefinementDescription(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional: Esta descrição ajudará os participantes a entenderem o foco da sessão
              </p>
            </div>

            {/* Configuração de Senha */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Proteger sessão com senha
                </span>
                <button
                  type="button"
                  onClick={togglePasswordProtection}
                  className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${requiresPassword ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${requiresPassword ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {requiresPassword && (
                <div className="space-y-2 transition-all duration-300">
                  <label htmlFor="sessionPassword" className="block text-sm font-medium text-gray-700">
                    Senha da Sessão *
                  </label>
                  <input
                    id="sessionPassword"
                    type="password"
                    placeholder="Digite uma senha para a sessão"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={sessionPassword}
                    onChange={(e) => setSessionPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Os participantes precisarão desta senha para entrar na sessão
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleGoBack}
                disabled={isCreating}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateRefinement}
                disabled={!newRefinementName.trim() || (requiresPassword && !sessionPassword.trim()) || isCreating}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${!newRefinementName.trim() || (requiresPassword && !sessionPassword.trim()) || isCreating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105'
                  }`}
              >
                {isCreating ? 'Criando...' : 'Criar Sessão'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            * Campos obrigatórios
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreationScene;