import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import RegisterScene from './RegisterScene';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

jest.mock('@/services/globalServices', () => ({
  validateEmailStepByStep: jest.fn(),
}));

const mockValidateEmailStepByStep = require('@/services/globalServices').validateEmailStepByStep;

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

jest.mock('../../components/Button', () => ({
  Button: jest.fn(({
    children,
    onClick,
    loading,
    disabled,
    type = 'button',
    variant = 'primary',
    className,
    ...props
  }: any) => {
    let testId = `button-${variant}`;
    const childrenText = Array.isArray(children)
      ? children.map(child => typeof child === 'string' ? child : '').join('')
      : String(children || '');

    if (childrenText.includes('Google')) {
      testId = 'button-google';
    } else if (childrenText.includes('Criar Conta')) {
      testId = 'button-submit';
    }

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={className}
        data-variant={variant}
        data-loading={loading}
        data-testid={testId}
        {...props}
      >
        {loading ? 'Carregando...' : children}
      </button>
    );
  }),
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('RegisterScene', () => {
  const mockNavigate = jest.fn();
  const mockSignUp = jest.fn();
  const mockSignInWithGoogle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const { useNavigate } = require('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);

    (useAuth as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
    });

    // Reset do mock da validação de email para retornar null (válido) por padrão
    mockValidateEmailStepByStep.mockReturnValue(null);
  });

  describe('Rendering', () => {
    it('should render registration form correctly', () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      expect(screen.getByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
      expect(screen.getByText('Cadastre-se para uma experiência personalizada')).toBeInTheDocument();
      expect(screen.getByText('Nova Conta')).toBeInTheDocument();
      expect(screen.getByText('Preencha os dados para se cadastrar')).toBeInTheDocument();

      expect(screen.getByLabelText('Nome Completo *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha *')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar Senha *')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
      expect(screen.getByText('Continuar com Google')).toBeInTheDocument();

      expect(screen.getByText('Fazer Login')).toBeInTheDocument();
      expect(screen.getByText('Já tem uma conta?')).toBeInTheDocument();
      expect(screen.getByText('* Campos obrigatórios')).toBeInTheDocument();
      expect(screen.getByText('Ao se cadastrar, você concorda com nossos Termos de Serviço')).toBeInTheDocument();
    });

    it('should show character count for name field', () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText('Nome Completo *');
      expect(screen.getByText('0/50')).toBeInTheDocument();

      fireEvent.change(nameInput, { target: { value: 'João' } });
      expect(screen.getByText('4/50')).toBeInTheDocument();

      fireEvent.change(nameInput, { target: { value: 'João Silva Santos Oliveira' } });
      expect(screen.getByText('26/50')).toBeInTheDocument();
    });

    it('should render Google icon in Google sign-in button', () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      const googleButton = screen.getByText('Continuar com Google');
      const googleIcon = googleButton.querySelector('svg');
      expect(googleIcon).toBeInTheDocument();
      expect(googleIcon).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      // Primeiro preenche o formulário para habilitar o botão
      fireEvent.change(screen.getByLabelText('Nome Completo *'), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Senha *'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: 'password123' }
      });

      // Agora limpa os campos para tornar inválido
      fireEvent.change(screen.getByLabelText('Nome Completo *'), {
        target: { value: '' }
      });

      const form = screen.getByTestId('register-form');

      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Nome é obrigatório');
      });
    });

    it('should show validation error for short name', async () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText('Nome Completo *'), {
        target: { value: 'J' }
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Senha *'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Nome deve ter pelo menos 2 caracteres');
      });
    });

    it('should show validation error for invalid email', async () => {
      mockValidateEmailStepByStep.mockReturnValueOnce('Email inválido');

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      // Preenche o formulário
      fireEvent.change(screen.getByLabelText('Nome Completo *'), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: 'invalid-email' }
      });
      fireEvent.change(screen.getByLabelText('Senha *'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: 'password123' }
      });

      const form = screen.getByTestId('register-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email inválido');
      });

      expect(mockValidateEmailStepByStep).toHaveBeenCalledWith('invalid-email');
    });

    it('should show validation error for long email', async () => {
      mockValidateEmailStepByStep.mockReturnValueOnce('Email muito longo');

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      const longEmail = 'a'.repeat(255) + '@example.com';

      fireEvent.change(screen.getByLabelText('Nome Completo *'), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: longEmail }
      });
      fireEvent.change(screen.getByLabelText('Senha *'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: 'password123' }
      });

      const form = screen.getByTestId('register-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email muito longo');
      });

      expect(mockValidateEmailStepByStep).toHaveBeenCalledWith(longEmail);
    });

    it('should show validation error for short password', async () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      // Preenche todos os campos corretamente primeiro
      fireEvent.change(screen.getByLabelText('Nome Completo *'), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Senha *'), {
        target: { value: 'password123' } // Senha longa primeiro
      });
      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: 'password123' }
      });

      // Agora muda para senha curta
      fireEvent.change(screen.getByLabelText('Senha *'), {
        target: { value: '123' }
      });
      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: '123' }
      });

      const form = screen.getByTestId('register-form');

      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Senha deve ter pelo menos 6 caracteres');
      });
    });

    it('should show real-time error for mismatched passwords', async () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText('Senha *'), {
        target: { value: 'password123' }
      });

      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: 'different' }
      });

      await waitFor(() => {
        expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: 'password123' }
      });

      await waitFor(() => {
        expect(screen.queryByText('As senhas não coincidem')).not.toBeInTheDocument();
      });
    });

    it('should disable submit button when form is invalid', () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
      expect(submitButton).toBeDisabled();

      // Testa diferentes estados de invalidez
      const testCases = [
        { field: 'Nome Completo *', value: 'J', expected: false }, // Nome curto
        { field: 'Email *', value: 'invalid', expected: false }, // Email inválido
        { field: 'Senha *', value: '123', expected: false }, // Senha curta
        { field: 'Confirmar Senha *', value: '456', expected: false }, // Senhas diferentes
      ];

      testCases.forEach(({ field, value, expected }) => {
        fireEvent.change(screen.getByLabelText(field), { target: { value } });
        if (expected) {
          expect(submitButton).not.toBeDisabled();
        } else {
          expect(submitButton).toBeDisabled();
        }

        // Limpa o campo após cada teste
        fireEvent.change(screen.getByLabelText(field), { target: { value: '' } });
      });
    });
  });

  describe('Email/Password Registration', () => {
    it('should handle successful registration', async () => {
      mockSignUp.mockResolvedValueOnce(undefined);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      // Use fireEvent.submit no formulário em vez de click no botão
      fireEvent.change(screen.getByLabelText('Nome Completo *'), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: 'joao@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Senha *'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
        target: { value: 'password123' }
      });

      const form = screen.getByTestId('register-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('joao@example.com', 'password123', 'João Silva');
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Conta criada com sucesso!');
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle registration error - email already in use', async () => {
      const error = { code: 'auth/email-already-in-use' };
      mockSignUp.mockRejectedValueOnce(error);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fillForm();

      const form = screen.getByTestId('register-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Este email já está em uso.');
      });
    });

    it('should handle registration error - invalid email', async () => {
      const error = { code: 'auth/invalid-email' };
      mockSignUp.mockRejectedValueOnce(error);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fillForm();
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email inválido.');
      });
    });

    it('should handle registration error - weak password', async () => {
      const error = { code: 'auth/weak-password' };
      mockSignUp.mockRejectedValueOnce(error);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fillForm();
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Senha muito fraca.');
      });
    });

    it('should handle generic registration error', async () => {
      const error = { code: 'auth/unknown-error' };
      mockSignUp.mockRejectedValueOnce(error);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fillForm();
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao criar conta. Tente novamente.');
      });
    });
  });

  describe('Google Registration', () => {
    it('should handle successful Google registration for new user', async () => {
      const mockResult = { isNewUser: true };
      mockSignInWithGoogle.mockResolvedValueOnce(mockResult);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fireEvent.click(screen.getByText('Continuar com Google'));

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Conta criada com Google!');
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle successful Google sign-in for existing user', async () => {
      const mockResult = { isNewUser: false };
      mockSignInWithGoogle.mockResolvedValueOnce(mockResult);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fireEvent.click(screen.getByText('Continuar com Google'));

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Login realizado com Google!');
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle Google registration error', async () => {
      const errorMessage = 'Erro de autenticação do Google';
      mockSignInWithGoogle.mockRejectedValueOnce(new Error(errorMessage));

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fireEvent.click(screen.getByText('Continuar com Google'));

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
      });
    });
  });

  describe('UI Interactions', () => {
    it('should toggle password visibility', () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText('Senha *');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha *');
      const toggleButtons = screen.getAllByRole('button', { name: '' });

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      fireEvent.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      fireEvent.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should have correct link to login page', () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      const loginLink = screen.getByText('Fazer Login');
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during registration', async () => {
      let resolveSignUp: (value?: any) => void;
      const signUpPromise = new Promise<void>((resolve) => {
        resolveSignUp = resolve;
      });
      mockSignUp.mockReturnValue(signUpPromise);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fillForm();

      const form = screen.getByTestId('register-form');
      fireEvent.submit(form);

      // Aguarde o loading ser ativado
      await waitFor(() => {
        expect(screen.getByTestId('button-submit')).toHaveTextContent('Carregando...');
      });

      await waitFor(() => {
        expect(screen.getByTestId('button-submit')).toBeDisabled();
      });

      await act(async () => {
        resolveSignUp!();
      });

      // Aguarde o loading ser desativado
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
      });
    });

    it('should show loading state during Google registration', async () => {
      let resolveGoogleSignIn: (value?: any) => void;
      const googlePromise = new Promise<void>((resolve) => {
        resolveGoogleSignIn = resolve;
      });
      mockSignInWithGoogle.mockReturnValue(googlePromise);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fireEvent.click(screen.getByText('Continuar com Google'));

      await waitFor(() => {
        const googleButton = screen.getByTestId('button-google');
        expect(googleButton).toHaveTextContent('Carregando...');
        expect(googleButton).toBeDisabled();
      });

      await act(async () => {
        resolveGoogleSignIn!();
      });

      await waitFor(() => {
        expect(screen.getByText('Continuar com Google')).toBeInTheDocument();
      });
    });

    it('should disable form fields during loading', async () => {
      let resolveSignUp: (value?: any) => void;
      const signUpPromise = new Promise<void>((resolve) => {
        resolveSignUp = resolve;
      });
      mockSignUp.mockReturnValue(signUpPromise);

      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      fillForm();

      const form = screen.getByTestId('register-form');
      fireEvent.submit(form);

      // Aguarde o loading ser ativado e os campos serem desabilitados
      await waitFor(() => {
        expect(screen.getByLabelText('Nome Completo *')).toBeDisabled();
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Email *')).toBeDisabled();
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Senha *')).toBeDisabled();
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Confirmar Senha *')).toBeDisabled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('button-google')).toBeDisabled();
      });

      await act(async () => {
        resolveSignUp!();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and attributes', () => {
      render(
        <BrowserRouter>
          <RegisterScene />
        </BrowserRouter>
      );

      expect(screen.getByLabelText('Nome Completo *')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Email *')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Senha *')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Confirmar Senha *')).toHaveAttribute('type', 'password');

      expect(screen.getByLabelText('Nome Completo *')).toBeRequired();
      expect(screen.getByLabelText('Email *')).toBeRequired();
      expect(screen.getByLabelText('Senha *')).toBeRequired();
      expect(screen.getByLabelText('Confirmar Senha *')).toBeRequired();
    });
  });
});

function fillForm() {
  fireEvent.change(screen.getByLabelText('Nome Completo *'), {
    target: { value: 'João Silva' }
  });
  fireEvent.change(screen.getByLabelText('Email *'), {
    target: { value: 'joao@example.com' }
  });
  fireEvent.change(screen.getByLabelText('Senha *'), {
    target: { value: 'password123' }
  });
  fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
    target: { value: 'password123' }
  });
}