import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomeScene from './HomeScene';

// Mock dos contextos e hooks
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../components/LoadingOverlay', () => ({
  LoadingOverlay: ({ message = 'Carregando...' }: { message?: string }) => (
    <div data-testid="loading-overlay">{message}</div>
  ),
}));

const mockUseAuth = require('../../contexts/AuthContext').useAuth;

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomeScene', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock padrão para casos de sucesso
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'user123',
        displayName: 'João Silva',
      },
      anonymousUser: false,
      loading: false,
    });
  });

  describe('Loading behavior', () => {
    it('should show LoadingOverlay when loading is true', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        anonymousUser: null,
        loading: true,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    it('should show LoadingOverlay initially and then display content', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', displayName: 'Test User' },
        anonymousUser: false,
        loading: false,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/Bem vindo Test User ao jogo de refinamento!/)).toBeInTheDocument();
    });

    it('should go through checkingProfile state before showing content', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', displayName: 'Valid User' },
        anonymousUser: false,
        loading: false,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Bem vindo Valid User/)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Navigation redirects', () => {
    it('should redirect to name-entry when user has invalid name (too short)', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', displayName: 'A' },
        anonymousUser: true,
        loading: false,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/name-entry');
      });
    });

    it('should redirect to name-entry when user is "Convidado"', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', displayName: 'Convidado' },
        anonymousUser: true,
        loading: false,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/name-entry');
      });
    });

    it('should redirect to name-entry when there is no user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        anonymousUser: true,
        loading: false,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/name-entry');
      });
    });
  });

  describe('Main content', () => {
    it('should render content when user is authenticated with valid name', async () => {
      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Bem vindo João Silva ao jogo de refinamento!')).toBeInTheDocument();
      expect(screen.getByText('Colabore e jogue com sua equipe em tempo real.')).toBeInTheDocument();
      expect(screen.getByText('Crie uma nova sessão')).toBeInTheDocument();
      expect(screen.getByText('Junte-se a uma sessão')).toBeInTheDocument();
    });

    it('should navigate to session-creation when clicking create session card', async () => {
      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const createCard = screen.getByText('Crie uma nova sessão').closest('div');
      fireEvent.click(createCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/session-creation');
    });

    it('should navigate to join-a-session when clicking join session card', async () => {
      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const joinCard = screen.getByText('Junte-se a uma sessão').closest('div');
      fireEvent.click(joinCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/join-a-session');
    });

    it('should display user name correctly in the title', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          uid: 'user456',
          displayName: 'Maria Santos',
        },
        anonymousUser: false,
        loading: false,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Bem vindo Maria Santos ao jogo de refinamento!')).toBeInTheDocument();
    });
  });

  describe('Special cases', () => {
    it('should not redirect while loading is true', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        anonymousUser: true,
        loading: true,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should allow user with 2-character displayName', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: '123', displayName: 'Jo' },
        anonymousUser: false,
        loading: false,
      });

      render(
        <BrowserRouter>
          <HomeScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Bem vindo Jo ao jogo de refinamento!')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalledWith('/name-entry');
    });
  });
});