import { useState } from 'react';
import { useRefinementCreation } from '../../hooks/useRefinementCreation';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

const CreationScene: React.FC = () => {
  const {
    formData,
    isCreating,
    handleCreateRefinement,
    updateFormData
  } = useRefinementCreation();

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const togglePasswordProtection = () => {
    const newValue = !formData.requiresPassword;
    updateFormData('requiresPassword', newValue);

    if (!newValue) {
      updateFormData('password', '');
      setConfirmPassword('');
      setPasswordError('');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (value: string) => {
    updateFormData('password', value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const validatePasswords = (): boolean => {
    if (!formData.requiresPassword) return true;

    if (formData.password.length < 4) {
      setPasswordError('A senha deve ter pelo menos 4 caracteres');
      return false;
    }

    if (formData.password !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleCreateWithValidation = async () => {
    if (!validatePasswords()) {
      return;
    }

    await handleCreateRefinement();
  };

  const isFormValid = formData.name.trim() &&
    (!formData.requiresPassword || (formData.password.trim() && confirmPassword.trim()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Criar Nova Sessão
          </h1>
          <p className="text-gray-600">
            Configure uma nova sessão de refinamento para sua equipe
          </p>
        </div>

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
                value={formData.name}
                onChange={(e) => updateFormData('name', (e.target as HTMLInputElement).value)}
                maxLength={100}
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.name.length}/100
              </p>
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
                value={formData.description}
                onChange={(e) => updateFormData('description', (e.target as HTMLTextAreaElement).value)}
                maxLength={500}
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>Opcional: Esta descrição ajudará os participantes</span>
                <span>{formData.description.length}/500</span>
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
                  data-testid="password-protection-switch"
                  disabled={isCreating}
                  className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.requiresPassword ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.requiresPassword ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {formData.requiresPassword && (
                <div className="space-y-4 transition-all duration-300">
                  {/* Campo de Senha */}
                  <div>
                    <label htmlFor="sessionPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Senha da Sessão *
                    </label>
                    <div className="relative">
                      <input
                        id="sessionPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite uma senha para a sessão"
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                        value={formData.password}
                        onChange={(e) => handlePasswordChange((e.target as HTMLInputElement).value)}
                        minLength={4}
                        disabled={isCreating}
                      />
                      <button
                        type="button"
                        onClick={toggleShowPassword}
                        disabled={isCreating}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      A senha deve ter pelo menos 4 caracteres
                    </p>
                  </div>

                  {/* Campo de Confirmação de Senha */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite a senha novamente"
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                        value={confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange((e.target as HTMLInputElement).value)}
                        minLength={4}
                        disabled={isCreating}
                      />
                      <button
                        type="button"
                        onClick={toggleShowPassword}
                        disabled={isCreating}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mensagem de Erro */}
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-fade-in">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {passwordError}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleGoBack}
                disabled={isCreating}
                variant="secondary"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleCreateWithValidation}
                disabled={!isFormValid || isCreating || (formData.requiresPassword && !!passwordError)}
                loading={isCreating}
                className="flex-1"
              >
                Criar Sessão
              </Button>
            </div>
          </div>
        </div>

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