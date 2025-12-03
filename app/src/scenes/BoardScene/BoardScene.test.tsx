import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import BoardScene from './BoardScene';
import { Card } from '@/types/global';

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
  getSortedCards: jest.fn((cards) => cards),
}));

jest.mock('../../services/globalServices', () => ({
  returnTimerId: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

jest.mock('../../components/LoadingOverlay', () => ({
  LoadingOverlay: ({ message }: { message?: string }) => (
    <div data-testid="loading-overlay">{message}</div>
  ),
}));

jest.mock('./components/BoardCard', () => ({
  __esModule: true,
  default: ({ card, timeEnded }: any) => (
    <div data-testid="board-card" data-time-ended={timeEnded}>
      Card: {card.text} - {card.teamName}
      {timeEnded && <span data-testid="readonly-mode">Modo leitura</span>}
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
  default: ({
    timerId,
    user,
    currentTeam,
    sessionTeams,
    onTimeEnd,
    onTimerStateChange,
    onTimerLoaded,
    isSessionClosed
  }: any) => {
    // Esta função será chamada quando o componente for montado
    React.useEffect(() => {
      // Simular que o timer foi carregado
      setTimeout(() => {
        onTimerLoaded?.();
      }, 0);

      // Se a sessão está fechada, chamar onTimeEnd imediatamente
      if (isSessionClosed) {
        setTimeout(() => {
          onTimeEnd?.();
          onTimerStateChange?.(true);
        }, 0);
      }
    }, []);

    return (
      <div data-testid="sync-timer">
        Sync Timer - {currentTeam}
        <button
          data-testid="trigger-time-end"
          onClick={() => {
            onTimeEnd?.();
            onTimerStateChange?.(true);
          }}
        >
          Simular tempo esgotado
        </button>
        <button
          data-testid="trigger-session-closed"
          onClick={() => {
            onTimeEnd?.();
            onTimerStateChange?.(true);
          }}
        >
          Simular sessão encerrada
        </button>
        <button
          data-testid="trigger-timer-loaded"
          onClick={() => onTimerLoaded?.()}
        >
          Simular timer carregado
        </button>
        <div data-testid="session-closed-status">
          {isSessionClosed ? 'Sessão Encerrada' : 'Sessão Ativa'}
        </div>
      </div>
    );
  },
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
  Button: ({ onClick, loading, variant, children, className, disabled, title }: any) => (
    <button
      data-testid={`button-${variant || 'default'}`}
      onClick={onClick}
      disabled={loading || disabled}
      className={className}
      title={title}
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
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));

jest.mock('./components/CardSorteningSelector', () => ({
  __esModule: true,
  default: ({ sortBy, onSortChange }: any) => (
    <div data-testid="card-sorting-selector">
      <select
        data-testid="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="newest">Mais Recentes</option>
        <option value="oldest">Mais Antigos</option>
        <option value="highest">Maior Avaliação</option>
        <option value="lowest">Menor Avaliação</option>
        <option value="mostComments">Mais Comentários</option>
        <option value="leastComments">Menos Comentários</option>
        <option value="author">Por Autor</option>
      </select>
    </div>
  ),
  SortOption: {}
}));

jest.mock('../../components/MasonryGrid', () => ({
  __esModule: true,
  default: ({ children, className }: any) => (
    <div data-testid="masonry-grid" className={className}>
      {children}
    </div>
  ),
}));

const mockGetSession = require('../../services/firestore/firestoreServices').getSession;
const mockCreateCardInFirestore = require('../../services/firestore/firestoreServices').createCardInFirestore;
const mockCreateUnsubscribeSession = require('../../hooks/firestoreUnsubscriber').createUnsubscribeSession;
const mockCreateUnsubscribeCards = require('../../hooks/firestoreUnsubscriber').createUnsubscribeCards;
const mockReturnTimerId = require('../../services/globalServices').returnTimerId;
const mockUseParams = require('react-router-dom').useParams;
const mockGetSortedCards = require('../../services/boardServices').getSortedCards;

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
    title: 'Test Session',
    description: 'Test description for the session',
    teams: {
      'user123': 'Time A',
    },
    numOfTeams: 2,
    hasStarted: true,
    isClosed: false,
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

    mockUseParams.mockReturnValue({
      sessionId: 'session123',
      teamName: 'Time A',
    });

    mockGetSession.mockResolvedValue(mockSession);
    mockReturnTimerId.mockReturnValue('timer123');
    mockCreateUnsubscribeSession.mockReturnValue(jest.fn());
    mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (cards: any[]) => void) => {
      // Usar setTimeout para simular carregamento assíncrono
      setTimeout(() => {
        callback(mockCards);
      }, 0);
      return jest.fn();
    });
    mockGetSortedCards.mockImplementation((cards: Card[]) => cards);
  });

  describe('Loading state', () => {
    it('should show LoadingOverlay when loading session data', async () => {
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

      expect(screen.getByText('Test Session')).toBeInTheDocument();
      expect(screen.getByText('Time A')).toBeInTheDocument();
      expect(screen.getByText('Participante:')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
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

    it('should render card creation form when user is in current team and time has not ended', async () => {
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
  });

  describe('Time ended functionality', () => {
    it('should show time ended message and hide card creation when time ends', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Simular tempo esgotado
      const triggerTimeEnd = screen.getByTestId('trigger-time-end');
      fireEvent.click(triggerTimeEnd);

      await waitFor(() => {
        expect(screen.getByText('Tempo Esgotado!')).toBeInTheDocument();
      });

      expect(screen.queryByText('Adicionar Nova Sugestão')).not.toBeInTheDocument();
      expect(screen.queryByTestId('variable-textarea')).not.toBeInTheDocument();
    });

    it('should show session closed message when session is closed', async () => {
      // Mock de sessão encerrada
      const closedSession = { ...mockSession, isClosed: true };
      mockGetSession.mockResolvedValue(closedSession);

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Sessão Encerrada!')).toBeInTheDocument();
      expect(screen.queryByText('Adicionar Nova Sugestão')).not.toBeInTheDocument();
    });

    it('should navigate to review when review button is clicked', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Aguardar cards carregarem
      await waitFor(() => {
        expect(screen.getByTestId('sync-timer')).toBeInTheDocument();
      });

      // Simular tempo esgotado
      const triggerTimeEnd = screen.getByTestId('trigger-time-end');

      await act(async () => {
        fireEvent.click(triggerTimeEnd);
      });

      // Aguardar botão aparecer
      await waitFor(() => {
        const reviewButtons = screen.getAllByText('Revisão Anônima');
        expect(reviewButtons.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // Clicar no primeiro botão de revisão encontrado
      const reviewButtons = screen.getAllByText('Revisão Anônima');
      await act(async () => {
        fireEvent.click(reviewButtons[0]);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/review/session123');
    });

    it('should pass timeEnded prop to BoardCard components when time ends', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Verificar que inicialmente não está em modo leitura
      const boardCards = screen.getAllByTestId('board-card');
      expect(boardCards[0]).not.toHaveAttribute('data-time-ended', 'true');

      // Simular tempo esgotado
      const triggerTimeEnd = screen.getByTestId('trigger-time-end');
      fireEvent.click(triggerTimeEnd);

      await waitFor(() => {
        const updatedBoardCards = screen.getAllByTestId('board-card');
        expect(updatedBoardCards[0]).toHaveAttribute('data-time-ended', 'true');
      });
    });
  });

  describe('User team validation', () => {
    it('should show warning when user is not in current team', async () => {
      // Mock para usuário em time diferente
      mockUseParams.mockReturnValue({
        sessionId: 'session123',
        teamName: 'Time B', // Usuário está no Time A, mas visualizando Time B
      });

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Tempo Esgotado!')).toBeInTheDocument();
    });

    it('should hide card creation when user is not in current team', async () => {
      // Mock para usuário em time diferente
      mockUseParams.mockReturnValue({
        sessionId: 'session123',
        teamName: 'Time B',
      });

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Adicionar Nova Sugestão')).not.toBeInTheDocument();
      expect(screen.queryByTestId('variable-textarea')).not.toBeInTheDocument();
    });
  });

  describe('Card creation', () => {
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

    it('should not create card when time has ended', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Simular tempo esgotado
      const triggerTimeEnd = screen.getByTestId('trigger-time-end');
      fireEvent.click(triggerTimeEnd);

      await waitFor(() => {
        expect(screen.queryByTestId('variable-textarea')).not.toBeInTheDocument();
      });

      // Garantir que a função não foi chamada
      expect(mockCreateCardInFirestore).not.toHaveBeenCalled();
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

      await waitFor(() => {
        expect(screen.getByText('Sugestões do Time A')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('(2 sugestões)')).toBeInTheDocument();
      expect(screen.getAllByTestId('board-card')).toHaveLength(2);
    });

    it('should show empty state when no cards', async () => {
      mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (cards: any[]) => void) => {
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

    it('should show loading skeletons while cards are loading', async () => {
      mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (cards: any[]) => void) => {
        // Não chama o callback imediatamente para simular loading
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

      expect(screen.getAllByTestId('card-skeleton')).toHaveLength(6);
    });

    it('should show loading spinner while creating card', async () => {
      mockCreateCardInFirestore.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

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

      fireEvent.change(textarea, { target: { value: 'Test card' } });
      fireEvent.click(submitButton);

      // Deve mostrar spinner de carregamento
      expect(screen.getByTestId('loading-spinner-sm')).toBeInTheDocument();
      expect(screen.getByText('Criando sugestão...')).toBeInTheDocument();
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
      mockUseAuth.mockReturnValue({
        user: {},
      });

      mockGetSession.mockResolvedValue(mockSession);

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/name-entry');
      });
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

      expect(screen.getByTestId('button-outline-secondary')).toBeInTheDocument();
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

    it('should navigate to review when review button is clicked', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Aguardar cards carregarem
      await waitFor(() => {
        expect(screen.getByTestId('sync-timer')).toBeInTheDocument();
      });

      // Simular tempo esgotado
      const triggerTimeEnd = screen.getByTestId('trigger-time-end');

      await act(async () => {
        fireEvent.click(triggerTimeEnd);
      });

      // Aguardar botão aparecer
      await waitFor(() => {
        const reviewButtons = screen.getAllByText('Revisão Anônima');
        expect(reviewButtons.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // Clicar no primeiro botão de revisão encontrado
      const reviewButtons = screen.getAllByText('Revisão Anônima');
      await act(async () => {
        fireEvent.click(reviewButtons[0]);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/review/session123');
    });
  });

  describe('Timer loaded state', () => {
    it('should handle timer loaded callback', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const triggerTimerLoaded = screen.getByTestId('trigger-timer-loaded');
      fireEvent.click(triggerTimerLoaded);

      await waitFor(() => {
        expect(screen.getByTestId('sync-timer')).toBeInTheDocument();
      });
    });
  });

  describe('Card sorting functionality', () => {
    it('should render CardSortingSelector when there are cards', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('card-sorting-selector')).toBeInTheDocument();
      expect(screen.getByTestId('sort-select')).toBeInTheDocument();
    });

    it('should not render CardSortingSelector when there are no cards', async () => {
      mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (cards: any[]) => void) => {
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

      expect(screen.queryByTestId('card-sorting-selector')).not.toBeInTheDocument();
    });

    it('should call getSortedCards with correct parameters', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // getSortedCards deve ser chamado com os cards do time e a opção de ordenação padrão
      expect(mockGetSortedCards).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ teamName: 'Time A' }),
          expect.objectContaining({ teamName: 'Time A' })
        ]),
        'newest'
      );
    });

    it('should update sorting when user changes sort option', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const sortSelect = screen.getByTestId('sort-select');

      // Mudar para ordenação por autor
      fireEvent.change(sortSelect, { target: { value: 'author' } });

      // getSortedCards deve ser chamado novamente com a nova opção
      expect(mockGetSortedCards).toHaveBeenCalledWith(
        expect.any(Array),
        'author'
      );
    });

    it('should display sorted cards when getSortedCards returns sorted array', async () => {
      // Mock para retornar cards ordenados de forma específica
      const mockSortedCards = [
        {
          id: 'card2',
          text: 'Second test card',
          teamName: 'Time A',
          createdBy: 'Maria Santos',
          createdById: 'user456',
          ratings: {},
          comments: [],
        },
        {
          id: 'card1',
          text: 'First test card',
          teamName: 'Time A',
          createdBy: 'João Silva',
          createdById: 'user123',
          ratings: {},
          comments: [],
        },
      ];

      mockGetSortedCards.mockReturnValue(mockSortedCards);

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Verificar que getSortedCards foi chamado
      expect(mockGetSortedCards).toHaveBeenCalled();

      // Os cards devem ser renderizados (embora o mock do BoardCard não mostre a ordem)
      const boardCards = screen.getAllByTestId('board-card');
      expect(boardCards).toHaveLength(2);
    });
  });

  describe('Session closed state', () => {
    it('should show review button when session is closed', async () => {
      const closedSession = { ...mockSession, isClosed: true };
      mockGetSession.mockResolvedValue(closedSession);

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      // Aguardar loading
      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Aguardar que o componente processe a sessão fechada
      await waitFor(() => {
        // Verificar se a mensagem de sessão encerrada aparece
        expect(screen.getByText('Sessão Encerrada!')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Verificar se o botão de revisão aparece
      await waitFor(() => {
        const reviewButtons = screen.getAllByText('Revisão Anônima');
        expect(reviewButtons.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('Footer buttons', () => {
    it('should show review button in footer when time ends', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Inicialmente não deve mostrar o botão
      expect(screen.queryByText('Revisão Anônima')).not.toBeInTheDocument();

      // Simular tempo esgotado
      const triggerTimeEnd = screen.getByTestId('trigger-time-end');
      fireEvent.click(triggerTimeEnd);

      await waitFor(() => {
        // Agora o botão deve estar visível no footer
        const buttons = screen.getAllByText('Revisão Anônima');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should not show review button when time is not ended', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Revisão Anônima')).not.toBeInTheDocument();
    });
  });

  describe('MasonryGrid usage', () => {
    it('should use MasonryGrid for cards layout', async () => {
      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
    });
  });

  describe('Timer safety timeout', () => {
    it('should set timer loaded after safety timeout', async () => {
      // Simular timer não carregando
      mockReturnTimerId.mockReturnValue('timer123');

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Aguardar timeout de segurança
      await waitFor(() => {
        expect(screen.getByTestId('sync-timer')).toBeInTheDocument();
      }, { timeout: 6000 }); // 5 segundos + margem
    });
  });

  describe('User team validation', () => {
    it('should show warning when user tries to view other team', async () => {
      // Usuário está no Time A, mas tentando acessar Time B
      mockUseParams.mockReturnValue({
        sessionId: 'session123',
        teamName: 'Time B',
      });

      render(
        <TestWrapper>
          <BoardScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Deve mostrar que o tempo esgotou (que é o indicativo de que não pode interagir)
      expect(screen.getByText('Tempo Esgotado!')).toBeInTheDocument();
    });

    it('should allow interaction when user is in correct team', async () => {
      mockUseParams.mockReturnValue({
        sessionId: 'session123',
        teamName: 'Time A',
      });

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
    });
  });
});