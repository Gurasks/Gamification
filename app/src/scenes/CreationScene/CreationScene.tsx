import { useLanguage } from '@/hooks/useLanguage';
import { useSessionCreation } from '@/hooks/useSessionCreation';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Lock,
  PlusCircle,
  Unlock,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

export const MAX_DESCRIPTION_LENGTH = 1500;

const CreationScene: React.FC = () => {
  const { t } = useLanguage();
  const {
    formData,
    isCreating,
    handleCreateSession,
    updateFormData
  } = useSessionCreation();

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
      setPasswordError(t('creation:passwordMinLength'));
      return false;
    }

    if (formData.password !== confirmPassword) {
      setPasswordError(t('validation:passwordsDoNotMatch'));
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleCreateWithValidation = async () => {
    if (!validatePasswords()) {
      return;
    }

    await handleCreateSession();
  };

  const isFormValid = formData.name.trim() &&
    (!formData.requiresPassword || (formData.password.trim() && confirmPassword.trim()));

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {t('creation:title')}
          </h1>
          <p className="text-gray-600">
            {t('creation:subtitle')}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('creation:cardTitle')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('creation:cardDescription')}
            </p>
          </div>

          <div className="space-y-4">
            {/* Session Name */}
            <div>
              <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {t('creation:sessionName')} *
              </label>
              <input
                id="sessionName"
                type="text"
                placeholder={t('creation:sessionNamePlaceholder')}
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

            {/* Session Description */}
            <div>
              <label htmlFor="sessionDescription" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                {t('creation:sessionDescription')}
              </label>
              <textarea
                id="sessionDescription"
                placeholder={t('creation:descriptionPlaceholder')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                value={formData.description}
                onChange={(e) => updateFormData('description', (e.target as HTMLTextAreaElement).value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>{t('creation:descriptionOptional')}</span>
                <span>{formData.description.length}/{MAX_DESCRIPTION_LENGTH}</span>
              </p>
            </div>

            {/* Password Protection */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {formData.requiresPassword ? (
                    <Lock className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Unlock className="w-4 h-4 text-gray-400" />
                  )}
                  {t('creation:protectWithPassword')}
                </span>
                <button
                  type="button"
                  onClick={togglePasswordProtection}
                  data-testid="password-protection-switch"
                  disabled={isCreating}
                  className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.requiresPassword ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  role="switch"
                  aria-checked={formData.requiresPassword}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.requiresPassword ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {formData.requiresPassword && (
                <div className="space-y-4 transition-all duration-300">
                  {/* Password Field */}
                  <div>
                    <label htmlFor="sessionPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('creation:sessionPassword')} *
                    </label>
                    <div className="relative">
                      <input
                        id="sessionPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('creation:passwordPlaceholder')}
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
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('creation:passwordMinLengthHint')}
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('creation:confirmPassword')} *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('creation:confirmPasswordPlaceholder')}
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
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-fade-in">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        {passwordError}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleGoBack}
                disabled={isCreating}
                variant="secondary"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.actions.back')}
              </Button>
              <Button
                onClick={handleCreateWithValidation}
                disabled={!isFormValid || isCreating || (formData.requiresPassword && !!passwordError)}
                loading={isCreating}
                className="flex-1"
              >
                {t('creation:createButton')}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {t('common.required')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreationScene;