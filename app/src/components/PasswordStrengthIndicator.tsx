import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { getPasswordStrength } from '@/services/globalServices';

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
  if (password.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-700">Força da senha:</span>
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

  return (
    <li className="flex items-center gap-2">
      <div className={`w-4 h-4 flex items-center justify-center rounded-full ${met ? 'bg-green-100' :
        warning ? 'bg-blue-100' :
          'bg-gray-100'
        }`}>
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
      <span className={`text-xs ${met ? 'text-green-700' :
        warning ? 'text-blue-600' :
          passwordLength > 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
        {label}
        {showCount && passwordLength > 0 && ` (${passwordLength}/${count})`}
      </span>
    </li>
  );
};

const ValidationMessage: React.FC<{
  password: string;
  confirmPassword?: string;
  isValidPassword: boolean;
}> = ({ password, confirmPassword, isValidPassword }) => {
  if (password.length === 0) return null;

  const passwordsMatch = confirmPassword ? password === confirmPassword && password.length > 0 : true;

  if (!isValidPassword) {
    return (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          A senha precisa atender a todos os requisitos mínimos
        </p>
      </div>
    );
  }

  if (confirmPassword && passwordsMatch) {
    return (
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-800 flex items-center gap-1">
          <Check className="w-3 h-3 flex-shrink-0" />
          Senha válida e confirmada!
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
  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword ? password === confirmPassword && password.length > 0 : true;

  const isValidPassword = password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  const getBasicRequirements = (): PasswordRequirement[] => [
    {
      id: 'length',
      label: 'Pelo menos 6 caracteres',
      met: password.length >= 6,
    },
    {
      id: 'uppercase',
      label: 'Pelo menos uma letra maiúscula',
      met: /[A-Z]/.test(password)
    },
    {
      id: 'number',
      label: 'Pelo menos um número',
      met: /[0-9]/.test(password)
    }
  ];

  const getOptionalRequirements = (): PasswordRequirement[] => {
    const requirements: PasswordRequirement[] = [];

    if (password.length > 0 && password.length < 8) {
      requirements.push({
        id: 'ideal-length',
        label: '8+ caracteres para maior segurança',
        met: false,
        optional: true,
        warning: true
      });
    }

    if (password.length > 0 && !/[^A-Za-z0-9]/.test(password)) {
      requirements.push({
        id: 'special-char',
        label: 'Caractere especial (!@#$%&*) recomendado',
        met: false,
        optional: true,
        warning: true
      });
    }

    if (confirmPassword !== undefined) {
      requirements.push({
        id: 'confirmation',
        label: password.length > 0 && confirmPassword.length > 0
          ? passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'
          : 'Confirme sua senha',
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
      {/* Barra de força da senha */}
      <StrengthBar strength={strength} password={password} />

      {/* Lista de requisitos */}
      {showRequirements && (
        <ul className="space-y-1.5">
          {/* Requisitos básicos */}
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

          {/* Requisitos opcionais */}
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

      {/* Resumo de validação */}
      <ValidationMessage
        password={password}
        confirmPassword={confirmPassword}
        isValidPassword={isValidPassword}
      />
    </div>
  );
};