import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BoardScene from './BoardScene';

// Mock dos serviços e hooks
jest.mock('../../services/firestore/firestoreServices', () => ({
  getSession: jest.fn(),
  createCardInFirestore: jest.fn(),
  updateRatingToCardInFirestore: jest.fn(),
  updateCardInFirestore: jest.fn(),
  addCommentToCardInFirestore: jest.fn(),
  updateCommentToCardInFirestore: jest.fn(),
}));

jest.mock('../../hooks/firestoreUnsubscriber', () => ({
  createUnsubscribeSession: jest.fn(),
  createUnsubscribeCards: jest.fn(),
}));

jest.mock('../../services/boardServices', () => ({
  getNextTeam: jest.fn(),
}));

jest.mock('../../services/teamSelectionServices', () => ({
  getAvailableTeams: jest.fn(),
}));

jest.mock('../../services/globalServices', () => ({
  returnTimerId: jest.fn(),
}));

jest.mock('../../components/LoadingOverlay', () => ({
  LoadingOverlay: ({ message }: { message?: string }) => (
    <div data-testid="loading-overlay">{message}</div>
  ),
}));

jest.mock('./components/BoardCard', () => ({
  __esModule: true,
  default: ({ card }: any) => (
    <div data-testid="board-card">
      Card: {card.text} - {card.teamName}
    </div>
  ),
}));

jest.mock('./components/CardSkeleton', () => ({
  CardSkeleton: () => <div data-testid="card-skeleton">Loading Card...</div>,
}));

jest.mock('../../components/VariableTextArea', () => ({
  __esModule: true,
  default: ({ text, setText, handleSubmit, disabled, placeholder }: any) => (
    <div>
      <textarea
        data-testid="variable-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        data-testid="submit-button"
        onClick={handleSubmit}
        disabled={disabled}
      >
        Submit
      </button>
    </div>
  ),
}));

jest.mock('./components/SyncTimer', () => ({
  __esModule: true,
  default: () => <div data-testid="sync-timer">Sync Timer</div>,
}));

jest.mock('../../components/CollapsibleDescriptionArea', () => ({
  __esModule: true,
  default: ({ sessionDescription, showDescription }: any) => (
    <div data-testid="collapsible-description">
      {showDescription && <p>{sessionDescription}</p>}
    </div>
  ),
}));

jest.mock('../../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ size, className }: any) => (
    <div data-testid={`loading-spinner-${size}`} className={className}>
      Loading...
    </div>
  ),
}));

jest.mock('../../components/Button', () => ({
  Button: ({ onClick, loading, variant, children, className }: any) => (
    <button
      data-testid={`button-${variant}`}
      onClick={onClick}
      disabled={loading}
      className={className}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

// Mock do useAuth
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock do useParams e useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    sessionId: 'session123',
    teamName: 'Time A',
  }),
  useNavigate: () => mockNavigate,
}));

const mockGetSession = require('../../services/firestore/firestoreServices').getSession;
const mockCreateCardInFirestore = require('../../services/firestore/firestoreServices').createCardInFirestore;
const mockCreateUnsubscribeSession = require('../../hooks/firestoreUnsubscriber').createUnsubscribeSession;
const mockCreateUnsubscribeCards = require('../../hooks/firestoreUnsubscriber').createUnsubscribeCards;
const mockGetNextTeam = require('../../services/boardServices').getNextTeam;
const mockGetAvailableTeams = require('../../services/teamSelectionServices').getAvailableTeams;
const mockReturnTimerId = require('../../services/globalServices').returnTimerId;

// Wrapper simplificado
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('BoardScene', () => {
  const mockUser = {
    uid: 'user123',
    displayName: 'João Silva',
    email: 'joao@example.com',
  };

  const mockSession = {
    id: 'session123',
    title: 'Test Session Session',
    description: 'Test description for the session session',
    teams: {
      'user123': 'Time A',
    },
    numOfTeams: 2,
    hasStarted: true,
  };

  const mockCards = [
    {
      id: 'card1',
      text: 'First test card',
      teamName: 'Time A',
      createdBy: 'João Silva',
      createdById: 'user123',
      ratings: {},
      comments: [],
    },
    {
      id: 'card2',
      text: 'Second test card',
      teamName: 'Time A',
      createdBy: 'Maria Santos',
      createdById: 'user456',
      ratings: {},
      comments: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
    });

    mockGetSession.mockResolvedValue(mockSession);
    mockGetAvailableTeams.mockReturnValue(['Time A', 'Time B']);
    mockReturnTimerId.mockReturnValue('timer123');
    mockCreateUnsubscribeSession.mockReturnValue(jest.fn());
    mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (arg0: { id: string; text: string; teamName: string; createdBy: string; createdById: string; ratings: {}; comments: never[]; }[]) => void) => {
      // Simula o callback sendo chamado com os cards
      callback(mockCards);
      return jest.fn();
    });
  });

  describe('Loading state', () => {
    it('should show LoadingOverlay when loading session data', async () => {
      // Mock para simular loading
      mockGetSession.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSession), 100)));

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('loading-overlay')).toHaveTextContent('Carregando sessão...');

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });
    });
  });

  describe('Main content rendering', () => {
    it('should render board content after loading', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Test Session Session')).toBeInTheDocument();
      expect(screen.getByText(/Time:/)).toBeInTheDocument();

      // Correção: Use query mais específica para evitar múltiplos elementos
      const timeElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'strong' && content === 'Time A';
      });
      expect(timeElement).toBeInTheDocument();

      expect(screen.getByText(/Participante:/)).toBeInTheDocument();

      const participantElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'strong' && content === 'João Silva';
      });
      expect(participantElement).toBeInTheDocument();
    });

    it('should render SyncTimer when session has started', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('sync-timer')).toBeInTheDocument();
    });

    it('should render collapsible description when available', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('collapsible-description')).toBeInTheDocument();
    });
  });

  describe('Card creation', () => {
    it('should render card creation form', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Adicionar Nova Sugestão')).toBeInTheDocument();
      expect(screen.getByTestId('variable-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should create card when form is submitted', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const textarea = screen.getByTestId('variable-textarea');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(textarea, { target: { value: 'New test card' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateCardInFirestore).toHaveBeenCalledWith(
          'New test card',
          'session123',
          mockUser,
          'Time A',
          expect.any(Function)
        );
      });
    });
  });

  describe('Team navigation', () => {
    it('should render team change button', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Mudar Time')).toBeInTheDocument();
    });

    it('should navigate to next team when change team button is clicked', async () => {
      // Correção: Mock precisa ser definido ANTES do render
      mockGetNextTeam.mockReturnValue('Time B');

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const changeTeamButton = screen.getByTestId('button-primary');

      // Simula o clique no botão
      fireEvent.click(changeTeamButton);

      // Aguarda a lógica assíncrona
      await waitFor(() => {
        expect(mockGetNextTeam).toHaveBeenCalledWith('Time A', ['Time A', 'Time B']);
      });

      // Verifica se a navegação ocorreu
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/board/session123/team/Time B');
      });
    });
  });

  describe('Cards display', () => {
    it('should display cards when loaded', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Aguarda um pouco mais para garantir que os cards sejam carregados
      await waitFor(() => {
        expect(screen.getByText('Sugestões do Time Time A')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('(2 sugestões)')).toBeInTheDocument();
      expect(screen.getAllByTestId('board-card')).toHaveLength(2);
    });

    it('should show empty state when no cards', async () => {
      // Mock para retornar array vazio de cards
      mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (arg0: never[]) => void) => {
        callback([]);
        return jest.fn();
      });

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Nenhuma sugestão ainda')).toBeInTheDocument();
      });

      expect(screen.getByText('Seja o primeiro a adicionar uma sugestão!')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should show session not found when session is not available', async () => {
      mockGetSession.mockResolvedValue(null);

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Sessão não encontrada')).toBeInTheDocument();
      expect(screen.getByText('Voltar ao Início')).toBeInTheDocument();
    });

    it('should redirect to name-entry when user is not authenticated', async () => {
      // Mock do user como objeto vazio (que será considerado empty pelo lodash)
      mockUseAuth.mockReturnValue({
        user: {}, // Objeto vazio
      });

      // Mock para getSession retornar rápido
      mockGetSession.mockResolvedValue(mockSession);

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      // Aguarda o redirecionamento
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/name-entry');
      }, { timeout: 2000 });
    });
  });

  describe('Navigation', () => {
    it('should have exit button to go back home', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('should navigate home when exit button is clicked', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const exitButton = screen.getByText('Sair');
      fireEvent.click(exitButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});