import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NameEntryScene from './NameEntryScene';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';

// Mock dos hooks e serviços
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/config/firebase', () => ({
  auth: {
    currentUser: {
      displayName: 'Test User',
      reload: jest.fn(),
    },
  },
}));

jest.mock('../../components/Button', () => ({
  Button: ({ onClick, loading, disabled, children, variant, type, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={variant ? `button-${variant}` : 'button-primary'}
      type={type}
      className={className}
    >
      {loading ? 'Carregando...' : children}
    </button>
  ),
}));

const mockUseAuth = require('@/contexts/AuthContext').useAuth;
const mockToast = require('react-hot-toast').default;
const mockAuth = require('@/config/firebase').auth;

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Wrapper para os providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('NameEntryScene', () => {
  const mockSignInAnonymously = jest.fn();
  const mockUpdateUserProfile = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock padrão - usuário não autenticado
    mockUseAuth.mockReturnValue({
      user: null,
      anonymousUser: false,
      signInAnonymously: mockSignInAnonymously,
      updateUserProfile: mockUpdateUserProfile,
      logout: mockLogout,
    });

    mockSignInAnonymously.mockResolvedValue(undefined);
    mockUpdateUserProfile.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue(undefined);
  });

  describe('Initial state for unauthenticated user', () => {
    it('should render welcome screen for unauthenticated user', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      expect(screen.getByText('Bem-vindo ao Refinamento')).toBeInTheDocument();
      expect(screen.getByText('Identifique-se para participar das sessões de refinamento')).toBeInTheDocument();
      expect(screen.getByText('Identificação Obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Digite seu nome para continuar como convidado')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ex: João Silva')).toBeInTheDocument();
      expect(screen.getByText('Continuar')).toBeInTheDocument();
    });

    it('should show login options for unauthenticated user', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      expect(screen.getByText('Ou faça login com sua conta')).toBeInTheDocument();
      expect(screen.getByText('Fazer Login')).toBeInTheDocument();
      expect(screen.getByText('Cadastrar')).toBeInTheDocument();
    });
  });

  describe('Initial state for authenticated anonymous user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', displayName: 'Old Name' },
        anonymousUser: true,
        signInAnonymously: mockSignInAnonymously,
        updateUserProfile: mockUpdateUserProfile,
        logout: mockLogout,
      });
    });

    it('should render name configuration screen for anonymous user', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      expect(screen.getByText('Configurar Nome')).toBeInTheDocument();
      expect(screen.getByText('Escolha como deseja ser identificado')).toBeInTheDocument();
      expect(screen.getByText('Alterar Nome')).toBeInTheDocument();
      expect(screen.getByText('Escolha um nome para ser identificado nas sessões')).toBeInTheDocument();
      expect(screen.getByText('Salvar Nome')).toBeInTheDocument();
      expect(screen.getByText('Sair e Fazer Login')).toBeInTheDocument();
    });

    it('should show anonymous mode warning', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      expect(screen.getByText('⚠️ Modo anônimo - seus dados serão perdidos ao sair')).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {

    it('should show error for empty name submission', async () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      // Use getByTestId diretamente em vez de getByRole
      const form = screen.getByTestId('name-entry-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Por favor, digite seu nome');
      });
    });

    it('should show error for name with less than 2 characters', async () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      fireEvent.change(input, { target: { value: 'A' } });

      // Use getByTestId diretamente em vez de getByRole
      const form = screen.getByTestId('name-entry-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('O nome deve ter pelo menos 2 caracteres');
      });
    });

    it('should disable submit button when name is invalid', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      const submitButton = screen.getByText('Continuar');

      // Empty name
      expect(submitButton).toBeDisabled();

      // Name with 1 character
      fireEvent.change(input, { target: { value: 'A' } });
      expect(submitButton).toBeDisabled();

      // Valid name
      fireEvent.change(input, { target: { value: 'João' } });
      expect(submitButton).not.toBeDisabled();
    });

    it('should show character count', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');

      fireEvent.change(input, { target: { value: 'João' } });

      // Busca por qualquer elemento que contenha o padrão de contador
      const counterElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('/50') || false;
      });
      expect(counterElements.length).toBeGreaterThan(0);

      fireEvent.change(input, { target: { value: 'João Silva' } });

      const updatedCounters = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('/50') || false;
      });
      expect(updatedCounters.length).toBeGreaterThan(0);
    });
  });

  describe('Form submission for unauthenticated user', () => {
    it('should call signInAnonymously with valid name', async () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      const submitButton = screen.getByText('Continuar');

      fireEvent.change(input, { target: { value: 'João Silva' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignInAnonymously).toHaveBeenCalledWith('João Silva');
      });

      expect(mockToast.success).toHaveBeenCalledWith('Bem-vindo, João Silva!');
    });

    it('should navigate to home after successful anonymous sign in', async () => {
      mockAuth.currentUser.displayName = 'João Silva';

      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      const submitButton = screen.getByText('Continuar');

      fireEvent.change(input, { target: { value: 'João Silva' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle errors during anonymous sign in', async () => {
      mockSignInAnonymously.mockRejectedValue(new Error('Sign in failed'));

      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      const submitButton = screen.getByText('Continuar');

      fireEvent.change(input, { target: { value: 'João Silva' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Erro ao configurar usuário. Tente novamente.');
      });
    });
  });

  describe('Form submission for anonymous user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', displayName: 'Old Name' },
        anonymousUser: true,
        signInAnonymously: mockSignInAnonymously,
        updateUserProfile: mockUpdateUserProfile,
        logout: mockLogout,
      });
    });

    it('should call updateUserProfile with new name', async () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      const submitButton = screen.getByText('Salvar Nome');

      fireEvent.change(input, { target: { value: 'Novo Nome' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateUserProfile).toHaveBeenCalledWith('Novo Nome');
      });

      expect(mockToast.success).toHaveBeenCalledWith('Nome atualizado para Novo Nome!');
    });

    it('should navigate to home after successful profile update', async () => {
      mockAuth.currentUser.displayName = 'Novo Nome';

      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      const submitButton = screen.getByText('Salvar Nome');

      fireEvent.change(input, { target: { value: 'Novo Nome' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Logout functionality', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', displayName: 'Test User' },
        anonymousUser: true,
        signInAnonymously: mockSignInAnonymously,
        updateUserProfile: mockUpdateUserProfile,
        logout: mockLogout,
      });
    });

    it('should call logout when logout button is clicked', async () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const logoutButton = screen.getByText('Sair e Fazer Login');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });

      expect(mockToast.success).toHaveBeenCalledWith('Sessão encerrada');
    });

    it('should handle logout errors', async () => {
      mockLogout.mockRejectedValue(new Error('Logout failed'));

      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const logoutButton = screen.getByText('Sair e Fazer Login');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Erro ao sair');
      });
    });
  });

  describe('Navigation to login/register', () => {
    it('should navigate to login when login button is clicked', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const loginButton = screen.getByText('Fazer Login');
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should navigate to register when register button is clicked', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const registerButton = screen.getByText('Cadastrar');
      fireEvent.click(registerButton);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('Loading states', () => {
    it('should show loading state during form submission', async () => {
      mockSignInAnonymously.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      const submitButton = screen.getByText('Continuar');

      fireEvent.change(input, { target: { value: 'João Silva' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Carregando...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });
    });

    it('should disable input during loading', async () => {
      mockSignInAnonymously.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Ex: João Silva');
      const submitButton = screen.getByText('Continuar');

      fireEvent.change(input, { target: { value: 'João Silva' } });
      fireEvent.click(submitButton);

      expect(input).toBeDisabled();

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('Additional information', () => {
    it('should show name visibility notice', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      expect(screen.getByText('* Seu nome será visível para outros participantes da sessão')).toBeInTheDocument();
    });

    it('should show minimum character requirement', () => {
      render(
        <TestWrapper>
          <NameEntryScene />
        </TestWrapper>
      );

      expect(screen.getByText('Mínimo 2 caracteres')).toBeInTheDocument();
    });
  });
});