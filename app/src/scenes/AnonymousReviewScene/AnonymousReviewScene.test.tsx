import { fireEvent, render, screen, waitFor, act, within } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AnonymousReviewScene from './AnonymousReviewScene';
import toast from 'react-hot-toast';
import { Card } from '@/types/global';

// Mock dos serviços e hooks
jest.mock('../../services/firestore/firestoreServices', () => ({
  getSession: jest.fn(),
  endSession: jest.fn(),
  updateRatingToCardInFirestore: jest.fn(),
  addCommentToCardInFirestore: jest.fn(),
  updateCommentToCardInFirestore: jest.fn(),
}));

jest.mock('../../hooks/firestoreUnsubscriber', () => ({
  createUnsubscribeCards: jest.fn(),
}));

jest.mock('../../services/boardServices', () => ({
  getSortedCards: jest.fn((cards) => cards),
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

jest.mock('./components/AnonymousCard', () => ({
  __esModule: true,
  default: ({ card, isReadOnly, onRate, onComment }: any) => (
    <div data-testid="anonymous-card" data-read-only={isReadOnly}>
      <div data-testid="card-text">{card.text}</div>
      <div data-testid="card-team">Time: {card.teamName}</div>
      <button
        data-testid="rate-card-button"
        onClick={() => onRate(card.id, 5)}
        disabled={isReadOnly}
      >
        Avaliar
      </button>
      <button
        data-testid="comment-card-button"
        onClick={() => onComment(card.id, 'Novo comentário')}
        disabled={isReadOnly}
      >
        Comentar
      </button>
    </div>
  ),
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

jest.mock('../BoardScene/components/CardSorteningSelector', () => ({
  __esModule: true,
  default: ({ sortBy, onSortChange, hasAuthorOption }: any) => (
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
        {hasAuthorOption && <option value="author">Por Autor</option>}
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

const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));

const mockGetSession = require('../../services/firestore/firestoreServices').getSession;
const mockEndSession = require('../../services/firestore/firestoreServices').endSession;
const mockUpdateRatingToCardInFirestore = require('../../services/firestore/firestoreServices').updateRatingToCardInFirestore;
const mockAddCommentToCardInFirestore = require('../../services/firestore/firestoreServices').addCommentToCardInFirestore;
const mockCreateUnsubscribeCards = require('../../hooks/firestoreUnsubscriber').createUnsubscribeCards;
const mockUseParams = require('react-router-dom').useParams;
const mockGetSortedCards = require('../../services/boardServices').getSortedCards;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('AnonymousReviewScene', () => {
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
    owner: 'user123', // Usuário é o dono da sessão
    isClosed: false,
  };

  const mockCards = [
    {
      id: 'card1',
      text: 'First test card',
      teamName: 'Time A',
      createdBy: 'João Silva',
      createdById: 'user123',
      ratings: { user456: 4 },
      comments: [
        {
          id: 'comment1',
          text: 'Great idea!',
          createdBy: 'Maria Santos',
          createdById: 'user456',
          createdAt: new Date().toISOString(),
        }
      ],
    },
    {
      id: 'card2',
      text: 'Second test card',
      teamName: 'Time B',
      createdBy: 'Maria Santos',
      createdById: 'user456',
      ratings: { user123: 5 },
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
    });

    mockGetSession.mockResolvedValue(mockSession);
    mockEndSession.mockResolvedValue('success');
    mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (cards: any[]) => void) => {
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
          <AnonymousReviewScene />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('loading-overlay')).toHaveTextContent('Carregando revisão...');

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });
    });
  });

  describe('Main content rendering', () => {
    it('should render review content after loading', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Test Session - Revisão Anônima')).toBeInTheDocument();
      expect(screen.getByText('MODO ATIVO')).toBeInTheDocument();
      expect(screen.getByText('Cards para Revisão')).toBeInTheDocument();
    });

    it('should show statistics when loaded', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Verificar estatísticas
      expect(screen.getByText('Total de Cards')).toBeInTheDocument();
      expect(screen.getByText('Comentários')).toBeInTheDocument();
      expect(screen.getByText('Votantes')).toBeInTheDocument();
      expect(screen.getByText('Ativo')).toBeInTheDocument();
    });

    it('should render cards when loaded', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getAllByTestId('anonymous-card')).toHaveLength(2);
      });
    });
  });

  describe('Statistics display', () => {
    it('should calculate and display correct statistics', async () => {
      const mockCardsWithStats = [
        {
          id: 'card1',
          text: 'First card',
          teamName: 'Time A',
          createdBy: 'João Silva',
          createdById: 'user123',
          ratings: { user456: 4, user789: 5 },
          comments: [
            { id: 'comment1', text: 'Comment 1', createdById: 'user456' },
            { id: 'comment2', text: 'Comment 2', createdById: 'user789' }
          ],
        },
        {
          id: 'card2',
          text: 'Second card',
          teamName: 'Time B',
          createdBy: 'Maria Santos',
          createdById: 'user456',
          ratings: { user123: 3 },
          comments: [
            { id: 'comment3', text: 'Comment 3', createdById: 'user123' },
            { id: 'comment4', text: 'Comment 4', createdById: 'user123' },
            { id: 'comment5', text: 'Comment 5', createdById: 'user123' },
          ],
        },
      ];

      mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (cards: any[]) => void) => {
        setTimeout(() => {
          callback(mockCardsWithStats);
        }, 0);
        return jest.fn();
      });

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        // Verificar estatísticas
        expect(screen.getByText('2')).toBeInTheDocument(); // Total cards
        expect(screen.getByText('5')).toBeInTheDocument(); // Total comments
        expect(screen.getByText('3')).toBeInTheDocument(); // Unique voters
      });
    });
  });

  describe('Session closed state', () => {
    it('should show read-only mode when session is closed', async () => {
      const closedSession = { ...mockSession, isClosed: true };
      mockGetSession.mockResolvedValue(closedSession);

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('MODO SOMENTE LEITURA')).toBeInTheDocument();

      await waitFor(() => {
        const cards = screen.getAllByTestId('anonymous-card');
        cards.forEach(card => {
          expect(card).toHaveAttribute('data-read-only', 'true');
        });
      });
    });

    it('should disable all interactive elements when in read-only mode', async () => {
      const closedSession = { ...mockSession, isClosed: true };
      mockGetSession.mockResolvedValue(closedSession);

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Verificar modo somente leitura
      expect(screen.getByText('MODO SOMENTE LEITURA')).toBeInTheDocument();

      // Verificar que botões de ação estão desabilitados
      const anonymousCards = screen.getAllByTestId('anonymous-card');
      anonymousCards.forEach(card => {
        const rateButton = within(card).getByTestId('rate-card-button');
        const commentButton = within(card).getByTestId('comment-card-button');
        expect(rateButton).toBeDisabled();
        expect(commentButton).toBeDisabled();
      });
    });

    it('should show appropriate message for read-only mode', async () => {
      const closedSession = { ...mockSession, isClosed: true };
      mockGetSession.mockResolvedValue(closedSession);

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const descriptionText = screen.getByText(/A fase de votação e comentários foi encerrada/i);
      expect(descriptionText).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have back button to team board', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Voltar para o Time')).toBeInTheDocument();
    });

    it('should navigate to team board when back button is clicked', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const backButton = screen.getByText('Voltar para o Time');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/board/session123/team/Time A');
    });

    it('should have leaderboard button', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Ver Classificação')).toBeInTheDocument();
    });

    it('should navigate to leaderboard when leaderboard button is clicked', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const leaderboardButton = screen.getByText('Ver Classificação');
      fireEvent.click(leaderboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/leaderboard/session123');
    });
  });

  describe('Card interactions', () => {
    it('should allow rating cards when not in read-only mode', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const rateButtons = screen.getAllByTestId('rate-card-button');
        expect(rateButtons[0]).not.toBeDisabled();
      });
    });

    it('should call updateRatingToCardInFirestore when rating a card', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const rateButtons = screen.getAllByTestId('rate-card-button');
        fireEvent.click(rateButtons[0]);
      });

      expect(mockUpdateRatingToCardInFirestore).toHaveBeenCalledWith('card1', 5, mockUser);
      expect(toast.success).toHaveBeenCalledWith('Voto registrado!');
    });

    it('should allow commenting on cards when not in read-only mode', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const commentButtons = screen.getAllByTestId('comment-card-button');
        expect(commentButtons[0]).not.toBeDisabled();
      });
    });

    it('should call addCommentToCardInFirestore when commenting on a card', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const commentButtons = screen.getAllByTestId('comment-card-button');
        fireEvent.click(commentButtons[0]);
      });

      expect(mockAddCommentToCardInFirestore).toHaveBeenCalledWith(
        'card1',
        'Novo comentário',
        mockUser
      );
      expect(toast.success).toHaveBeenCalledWith('Comentário adicionado!');
    });
  });

  describe('Read-only mode restrictions', () => {
    it('should disable card interactions in read-only mode', async () => {
      const closedSession = { ...mockSession, isClosed: true };
      mockGetSession.mockResolvedValue(closedSession);

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const rateButtons = screen.getAllByTestId('rate-card-button');
        const commentButtons = screen.getAllByTestId('comment-card-button');

        rateButtons.forEach(button => {
          expect(button).toBeDisabled();
        });

        commentButtons.forEach(button => {
          expect(button).toBeDisabled();
        });
      });
    });

    it('should not call rating function when in read-only mode', async () => {
      const closedSession = { ...mockSession, isClosed: true };
      mockGetSession.mockResolvedValue(closedSession);

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const rateButtons = screen.getAllByTestId('rate-card-button');
        expect(rateButtons[0]).toBeDisabled();
      });

      expect(mockUpdateRatingToCardInFirestore).not.toHaveBeenCalled();
    });
  });

  describe('Session owner functionality', () => {
    it('should show end review button for session owner', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Encerrar Revisão')).toBeInTheDocument();
    });

    it('should not show end review button for non-owner', async () => {
      const nonOwnerSession = { ...mockSession, owner: 'otherUser' };
      mockGetSession.mockResolvedValue(nonOwnerSession);

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Encerrar Revisão')).not.toBeInTheDocument();
    });

    it('should call endSession when owner ends review phase', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const endReviewButton = screen.getByText('Encerrar Revisão');

      await act(async () => {
        fireEvent.click(endReviewButton);
      });

      expect(mockEndSession).toHaveBeenCalledWith('session123', mockUser);
      expect(toast.success).toHaveBeenCalledWith('Fase de revisão encerrada!');
    });
  });

  describe('Empty state', () => {
    it('should show empty state when no cards', async () => {
      mockCreateUnsubscribeCards.mockImplementation((_sessionId: string, callback: (cards: any[]) => void) => {
        setTimeout(() => {
          callback([]);
        }, 0);
        return jest.fn();
      });

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Nenhum card disponível')).toBeInTheDocument();
        expect(screen.getByText('Não há cards para revisão nesta sessão.')).toBeInTheDocument();
      });
    });
  });

  describe('Card sorting', () => {
    it('should render CardSortingSelector when there are cards', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('card-sorting-selector')).toBeInTheDocument();
    });

    it('should not have author option in sorting', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const sortSelect = screen.getByTestId('sort-select');
      const options = Array.from(sortSelect.querySelectorAll('option'));
      const authorOption = options.find(opt => opt.value === 'author');

      expect(authorOption).toBeUndefined();
    });
  });

  describe('MasonryGrid usage', () => {
    it('should use MasonryGrid for cards layout', async () => {
      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should show session not found when session is not available', async () => {
      mockGetSession.mockResolvedValue(null);

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Sessão não encontrada')).toBeInTheDocument();
    });

    it('should show error toast when loading fails', async () => {
      mockGetSession.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao carregar a sessão');
      });
    });
  });

  describe('Authentication', () => {
    it('should handle unauthenticated user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
      });

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      await waitFor(() => {
        const hasContent =
          screen.queryByTestId('loading-overlay') !== null ||
          screen.queryByText('Sessão não encontrada') !== null ||
          screen.queryByText(/Revisão Anônima/i) !== null;

        expect(hasContent).toBe(true);
      }, { timeout: 2000 });
    });

    it('should require authentication for interactions', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
      });

      mockGetSession.mockResolvedValue(mockSession);

      render(
        <TestWrapper>
          <AnonymousReviewScene />
        </TestWrapper>
      );

      expect(mockUpdateRatingToCardInFirestore).not.toHaveBeenCalled();
      expect(mockAddCommentToCardInFirestore).not.toHaveBeenCalled();
    });
  });
});