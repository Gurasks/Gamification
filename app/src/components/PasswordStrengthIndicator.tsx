import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { getPasswordStrength } from '@/services/globalServices';
import { useLanguage } from '@/hooks/useLanguage';

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  showRequirements?: boolean;
  className?: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
  optional?: boolean;
  warning?: boolean;
}

const StrengthBar: React.FC<{ strength: any; password: string }> = ({ strength, password }) => {
  const { t } = useLanguage();

  if (password.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-700">{t('passwordStrength.strength')}:</span>
        <span className={`text-xs font-semibold ${strength.textColor}`}>
          {strength.label}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300 ease-out`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

const RequirementItem: React.FC<{
  label: string;
  met: boolean;
  passwordLength: number;
  optional?: boolean;
  warning?: boolean;
  showCount?: boolean;
  count?: number;
}> = ({ label, met, passwordLength, optional, warning, showCount, count }) => {
  const showIcon = passwordLength > 0 || optional || warning;

  const getTextColor = () => {
    if (met) return 'text-green-700';
    if (warning) return 'text-blue-600';
    if (passwordLength > 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getIconBgColor = () => {
    if (met) return 'bg-green-100';
    if (warning) return 'bg-blue-100';
    return 'bg-gray-100';
  };

  return (
    <li className="flex items-start gap-2 py-0.5 select-none">
      <div className={`w-4 h-4 flex items-center justify-center rounded-full ${getIconBgColor()} flex-shrink-0 mt-0.5`}>
        {showIcon ? (
          met ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : warning ? (
            <AlertTriangle className="w-3 h-3 text-blue-600" />
          ) : passwordLength > 0 ? (
            <X className="w-3 h-3 text-red-600" />
          ) : (
            <div className="w-3 h-3" />
          )
        ) : (
          <div className="w-3 h-3" />
        )}
      </div>
      <span className={`text-xs ${getTextColor()} leading-relaxed`}>
        {label}
        {showCount && passwordLength > 0 && (
          <span className="text-gray-400 ml-1">({passwordLength}/{count})</span>
        )}
      </span>
    </li>
  );
};

const ValidationMessage: React.FC<{
  password: string;
  confirmPassword?: string;
  isValidPassword: boolean;
}> = ({ password, confirmPassword, isValidPassword }) => {
  const { t } = useLanguage();

  if (password.length === 0) return null;

  const passwordsMatch = confirmPassword ? password === confirmPassword && password.length > 0 : true;

  if (!isValidPassword) {
    return (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {t('passwordStrength.meetAllRequirements')}
        </p>
      </div>
    );
  }

  if (confirmPassword && passwordsMatch) {
    return (
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-800 flex items-center gap-1">
          <Check className="w-3 h-3 flex-shrink-0" />
          {t('passwordStrength.validAndConfirmed')}
        </p>
      </div>
    );
  }

  return null;
};

const usePasswordRequirements = (
  password: string,
  confirmPassword?: string
) => {
  const { t } = useLanguage();

  const strength = getPasswordStrength(password, t);
  const passwordsMatch = confirmPassword ? password === confirmPassword && password.length > 0 : true;

  const isValidPassword = password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  const getBasicRequirements = (): PasswordRequirement[] => [
    {
      id: 'length',
      label: t('passwordStrength.minLength'),
      met: password.length >= 6,
    },
    {
      id: 'uppercase',
      label: t('passwordStrength.uppercase'),
      met: /[A-Z]/.test(password)
    },
    {
      id: 'number',
      label: t('passwordStrength.number'),
      met: /[0-9]/.test(password)
    }
  ];

  const getOptionalRequirements = (): PasswordRequirement[] => {
    const requirements: PasswordRequirement[] = [];

    if (password.length > 0 && password.length < 8) {
      requirements.push({
        id: 'ideal-length',
        label: t('passwordStrength.idealLength'),
        met: false,
        optional: true,
        warning: true
      });
    }

    if (password.length > 0 && !/[^A-Za-z0-9]/.test(password)) {
      requirements.push({
        id: 'special-char',
        label: t('passwordStrength.specialChar'),
        met: false,
        optional: true,
        warning: true
      });
    }

    if (confirmPassword !== undefined) {
      let confirmationLabel = t('passwordStrength.confirmPassword');

      if (password.length > 0 && confirmPassword.length > 0) {
        confirmationLabel = passwordsMatch
          ? t('passwordStrength.passwordsMatch')
          : t('passwordStrength.passwordsDoNotMatch');
      }

      requirements.push({
        id: 'confirmation',
        label: confirmationLabel,
        met: passwordsMatch && password.length > 0,
        optional: false
      });
    }

    return requirements;
  };

  return {
    strength,
    passwordsMatch,
    isValidPassword,
    getBasicRequirements,
    getOptionalRequirements
  };
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  confirmPassword,
  showRequirements = true,
  className = ''
}) => {
  const {
    strength,
    isValidPassword,
    getBasicRequirements,
    getOptionalRequirements
  } = usePasswordRequirements(password, confirmPassword);

  const basicRequirements = getBasicRequirements();
  const optionalRequirements = getOptionalRequirements();

  return (
    <div className={`space-y-3 ${className}`}>

      <StrengthBar strength={strength} password={password} />


      {showRequirements && (
        <ul className="space-y-1.5 list-none">
          {basicRequirements.map(req => (
            <RequirementItem
              key={req.id}
              label={req.label}
              met={req.met}
              passwordLength={password.length}
              showCount={req.id === 'length'}
              count={req.id === 'length' ? 6 : undefined}
            />
          ))}


          {optionalRequirements.map(req => (
            <RequirementItem
              key={req.id}
              label={req.label}
              met={req.met}
              passwordLength={password.length}
              optional={req.optional}
              warning={req.warning}
            />
          ))}
        </ul>
      )}

      <ValidationMessage
        password={password}
        confirmPassword={confirmPassword}
        isValidPassword={isValidPassword}
      />
    </div>
  );
};