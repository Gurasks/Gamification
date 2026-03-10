import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  X as XIcon,
  Loader2,
  LogIn,
  UserPlus,
  ArrowLeft
} from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { Button } from './Button';
import { validateEmailStepByStep, validatePassword } from '@/services/globalServices';
import { useLanguage } from '@/hooks/useLanguage';

export type AuthMode = 'login' | 'register';

const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-fade-in">
      <div className="flex items-center gap-2">
        <XIcon className="w-4 h-4 flex-shrink-0" />
        {error}
      </div>
    </div>
  );
};

const FormHeader: React.FC<{
  mode: AuthMode;
  message?: string;
  showBackButton: boolean;
  onBack?: () => void;
  backButtonLabel: string;
  isLoading: boolean;
  isGoogleLoading: boolean;
}> = ({ mode, message, showBackButton, onBack, backButtonLabel, isLoading, isGoogleLoading }) => {
  const { t } = useLanguage();

  return (
    <div className="text-center relative">
      {showBackButton && onBack && (
        <div className="absolute left-0 top-0">
          <Button
            onClick={onBack}
            variant="outline-secondary"
            size="sm"
            className="flex items-center justify-center gap-2"
            disabled={isLoading || isGoogleLoading}
          >
            <ArrowLeft className="w-4 h-4" />
            {backButtonLabel}
          </Button>
        </div>
      )}

      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
        {mode === 'login' ? (
          <LogIn className="w-8 h-8 text-blue-600" />
        ) : (
          <UserPlus className="w-8 h-8 text-green-600" />
        )}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {mode === 'login' ? t('auth.login') : t('auth.register')}
      </h2>
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
};

const PasswordInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  disabled?: boolean;
  confirmValue?: string;
  showConfirmIcon?: boolean;
}> = ({
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleShowPassword,
  disabled,
  confirmValue,
  showConfirmIcon
}) => {
    const passwordsMatch = confirmValue ? value === confirmValue && value.length > 0 : false;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <Lock className="w-4 h-4" />
          {label}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 disabled:opacity-50 pr-10 transition-all duration-200 ${confirmValue && value.length > 0
              ? passwordsMatch
                ? 'border-green-500 focus:ring-green-500'
                : 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
              }`}
            placeholder={placeholder}
            disabled={disabled}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {showConfirmIcon && confirmValue && value.length > 0 && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              {passwordsMatch ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <XIcon className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

const SubmitButton: React.FC<{
  mode: AuthMode;
  isLoading: boolean;
  disabled: boolean;
}> = ({ mode, isLoading, disabled }) => {
  const { t } = useLanguage();

  const getLoadingText = () => {
    return mode === 'login' ? t('auth.loggingIn') : t('auth.creatingAccount');
  };

  const getButtonText = () => {
    if (mode === 'login') {
      return (
        <>
          <LogIn className="w-4 h-4" />
          {t('auth.login')}
        </>
      );
    } else {
      return (
        <>
          <UserPlus className="w-4 h-4" />
          {t('auth.register')}
        </>
      );
    }
  };

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'login'
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
        : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
        }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {getLoadingText()}
        </>
      ) : (
        getButtonText()
      )}
    </button>
  );
};

const GoogleLoginButton: React.FC<{
  onGoogleLogin?: () => Promise<void>;
  isLoading: boolean;
  isGoogleLoading: boolean;
}> = ({ onGoogleLogin, isLoading, isGoogleLoading }) => {
  const { t } = useLanguage();

  if (!onGoogleLogin) return null;

  return (
    <>
      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-sm text-gray-500">{t('auth.or')}</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <button
        onClick={onGoogleLogin}
        disabled={isGoogleLoading || isLoading}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="w-5 h-5"
        />
        <span className="font-medium">
          {isGoogleLoading ? t('auth.connecting') : t('auth.links.loginWithGoogle')}
        </span>
      </button>
    </>
  );
};

const SwitchModeButton: React.FC<{
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
}> = ({ mode, onChange, isLoading, isGoogleLoading }) => {
  const { t } = useLanguage();

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600">
        {mode === 'login' ? t('auth.links.noAccount') : t('auth.links.hasAccount')}{' '}
        <button
          type="button"
          onClick={() => onChange(mode === 'login' ? 'register' : 'login')}
          className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition-colors"
          disabled={isLoading || isGoogleLoading}
        >
          {mode === 'login' ? t('auth.register') : t('auth.login')}
        </button>
      </p>
    </div>
  );
};

const useAuthValidation = (mode: AuthMode) => {
  const { t } = useLanguage();
  const [localError, setLocalError] = useState('');

  const validateForm = (
    email: string,
    password: string,
    displayName?: string,
    confirmPassword?: string
  ): boolean => {
    setLocalError('');

    const emailError = validateEmailStepByStep(email);
    if (emailError) {
      setLocalError(emailError);
      return false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setLocalError(passwordError);
      return false;
    }

    if (mode === 'register') {
      if (!displayName?.trim()) {
        setLocalError(t('auth.nameRequired'));
        return false;
      }
      if (displayName.trim().length < 2) {
        setLocalError(t('auth.nameMinLength'));
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError(t('auth.passwordsDoNotMatch'));
        return false;
      }
    }

    return true;
  };

  return {
    localError,
    setLocalError,
    validateForm
  };
};

const useAuthFormState = (mode: AuthMode) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = mode === 'login'
    ? email && password
    : email && password && displayName && confirmPassword && passwordsMatch;

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    displayName,
    setDisplayName,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    passwordsMatch,
    isFormValid,
    resetForm
  };
};

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (data: {
    email: string;
    password: string;
    displayName?: string;
    confirmPassword?: string;
  }) => Promise<void>;
  onGoogleLogin?: () => Promise<void>;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  error?: string;
  onModeChange?: (mode: AuthMode) => void;
  showGoogleButton?: boolean;
  message?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backButtonLabel?: string;
  className?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  onGoogleLogin,
  isLoading = false,
  isGoogleLoading = false,
  error,
  onModeChange,
  showGoogleButton = true,
  message,
  showBackButton = false,
  onBack,
  backButtonLabel,
  className = ''
}) => {
  const { t } = useLanguage();
  const formState = useAuthFormState(mode);
  const validation = useAuthValidation(mode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validation.validateForm(
      formState.email,
      formState.password,
      formState.displayName,
      formState.confirmPassword
    );

    if (!isValid) return;

    try {
      await onSubmit({
        email: formState.email,
        password: formState.password,
        ...(mode === 'register' && {
          displayName: formState.displayName.trim(),
          confirmPassword: formState.confirmPassword
        })
      });
    } catch (err: any) {
      validation.setLocalError(err.message || t('auth.requestError'));
    }
  };

  const handleModeChange = () => {
    const newMode: AuthMode = mode === 'login' ? 'register' : 'login';
    onModeChange?.(newMode);
    validation.setLocalError('');
    formState.resetForm();
  };

  const fullNameLabel = t('auth.fullName');
  const fullNamePlaceholder = t('auth.placeholders.fullName');
  const emailPlaceholder = t('auth.placeholders.email');
  const passwordPlaceholder = mode === 'login' ? t('auth.placeholders.password') : t('auth.placeholders.createPassword');
  const confirmPasswordPlaceholder = t('auth.placeholders.confirmPassword');
  const minLengthText = t('auth.minLength', { count: 2 });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <FormHeader
        mode={mode}
        message={message}
        showBackButton={showBackButton}
        onBack={onBack}
        backButtonLabel={backButtonLabel || t('common.actions.back')}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name (only for register) */}
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <User className="w-4 h-4" />
              {fullNameLabel} *
            </label>
            <input
              type="text"
              value={formState.displayName}
              onChange={(e) => formState.setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all duration-200"
              placeholder={fullNamePlaceholder}
              disabled={isLoading}
              required
              minLength={2}
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>{minLengthText}</span>
              <span>{formState.displayName.length}/50</span>
            </p>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {t('auth.fields.email')} *
          </label>
          <input
            type="email"
            value={formState.email}
            onChange={(e) => formState.setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all duration-200"
            placeholder={emailPlaceholder}
            disabled={isLoading}
            required
          />
        </div>

        {/* Password */}
        <PasswordInput
          label={t('auth.fields.password') + " *"}
          value={formState.password}
          onChange={formState.setPassword}
          placeholder={passwordPlaceholder}
          showPassword={formState.showPassword}
          onToggleShowPassword={() => formState.setShowPassword(!formState.showPassword)}
          disabled={isLoading}
        />

        {/* Confirm Password (only for register) */}
        {mode === 'register' && (
          <PasswordInput
            label={t('auth.confirmPassword') + " *"}
            value={formState.confirmPassword}
            onChange={formState.setConfirmPassword}
            placeholder={confirmPasswordPlaceholder}
            showPassword={formState.showConfirmPassword}
            onToggleShowPassword={() => formState.setShowConfirmPassword(!formState.showConfirmPassword)}
            disabled={isLoading}
            confirmValue={formState.password}
            showConfirmIcon
          />
        )}

        {/* Password Strength Indicator (only for register) */}
        {mode === 'register' && (
          <PasswordStrengthIndicator
            password={formState.password}
            confirmPassword={formState.confirmPassword}
            className="mt-3"
          />
        )}

        {/* Error Message */}
        <ErrorMessage error={error || validation.localError} />

        {/* Submit Button */}
        <SubmitButton
          mode={mode}
          isLoading={isLoading}
          disabled={!formState.isFormValid}
        />
      </form>

      {/* Google Login */}
      {showGoogleButton && (
        <GoogleLoginButton
          onGoogleLogin={onGoogleLogin}
          isLoading={isLoading}
          isGoogleLoading={isGoogleLoading}
        />
      )}

      {/* Switch Mode */}
      <SwitchModeButton
        mode={mode}
        onChange={handleModeChange}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
      />
    </div>
  );
};