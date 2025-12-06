import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { getPasswordStrength } from '@/services/globalServices';

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  showRequirements?: boolean;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  confirmPassword,
  showRequirements = true,
  className = ''
}) => {
  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword ? password === confirmPassword && password.length > 0 : true;

  const isValidPassword = password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barra de força da senha */}
      {password.length > 0 && (
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
      )}

      {/* Lista de requisitos */}
      {showRequirements && (
        <ul className="space-y-1.5">
          {/* Comprimento mínimo */}
          <li className="flex items-center gap-2">
            <div className={`w-4 h-4 flex items-center justify-center rounded-full ${password.length >= 6 ? 'bg-green-100' : 'bg-gray-100'}`}>
              {password.length >= 6 ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : password.length > 0 ? (
                <X className="w-3 h-3 text-red-600" />
              ) : (
                <div className="w-3 h-3" />
              )}
            </div>
            <span className={`text-xs ${password.length >= 6 ? 'text-green-700' : password.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              Pelo menos 6 caracteres {password.length > 0 && `(${password.length}/6)`}
            </span>
          </li>

          {/* Letra maiúscula */}
          <li className="flex items-center gap-2">
            <div className={`w-4 h-4 flex items-center justify-center rounded-full ${/[A-Z]/.test(password) ? 'bg-green-100' : 'bg-gray-100'}`}>
              {/[A-Z]/.test(password) ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : password.length > 0 ? (
                <X className="w-3 h-3 text-red-600" />
              ) : (
                <div className="w-3 h-3" />
              )}
            </div>
            <span className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-700' : password.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              Pelo menos uma letra maiúscula
            </span>
          </li>

          {/* Número */}
          <li className="flex items-center gap-2">
            <div className={`w-4 h-4 flex items-center justify-center rounded-full ${/[0-9]/.test(password) ? 'bg-green-100' : 'bg-gray-100'}`}>
              {/[0-9]/.test(password) ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : password.length > 0 ? (
                <X className="w-3 h-3 text-red-600" />
              ) : (
                <div className="w-3 h-3" />
              )}
            </div>
            <span className={`text-xs ${/[0-9]/.test(password) ? 'text-green-700' : password.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              Pelo menos um número
            </span>
          </li>

          {/* Comprimento ideal (opcional) */}
          {password.length > 0 && password.length < 8 && (
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-blue-100">
                <AlertTriangle className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-xs text-blue-600">
                8+ caracteres para maior segurança
              </span>
            </li>
          )}

          {/* Caractere especial (opcional) */}
          {password.length > 0 && !/[^A-Za-z0-9]/.test(password) && (
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-blue-100">
                <AlertTriangle className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-xs text-blue-600">
                Caractere especial (!@#$%&*) recomendado
              </span>
            </li>
          )}

          {/* Confirmação de senha */}
          {confirmPassword !== undefined && (
            <li className="flex items-center gap-2">
              <div className={`w-4 h-4 flex items-center justify-center rounded-full ${passwordsMatch && password.length > 0 ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                {passwordsMatch && password.length > 0 ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : password.length > 0 && confirmPassword.length > 0 ? (
                  <X className="w-3 h-3 text-red-600" />
                ) : (
                  <div className="w-3 h-3" />
                )}
              </div>
              <span className={`text-xs ${passwordsMatch && password.length > 0 ? 'text-green-700' :
                password.length > 0 && confirmPassword.length > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                {password.length > 0 && confirmPassword.length > 0
                  ? passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'
                  : 'Confirme sua senha'
                }
              </span>
            </li>
          )}
        </ul>
      )}

      {/* Resumo de validação */}
      {password.length > 0 && !isValidPassword && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            A senha precisa atender a todos os requisitos mínimos
          </p>
        </div>
      )}

      {password.length > 0 && isValidPassword && confirmPassword && passwordsMatch && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800 flex items-center gap-1">
            <Check className="w-3 h-3 flex-shrink-0" />
            Senha válida e confirmada!
          </p>
        </div>
      )}
    </div>
  );
};