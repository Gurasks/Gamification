import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeaderboardScene from './LeaderboardScene';

// Mock dos serviços e componentes
jest.mock('../../services/firestore/firestoreServices', () => ({
  fetchLeaderboardData: jest.fn(),
  getSession: jest.fn(),
  getCardsBySessionId: jest.fn(),
}));

jest.mock('../../services/teamSelectionServices', () => ({
  getAvailableTeams: jest.fn(),
}));

jest.mock('../../services/leaderboardServices', () => ({
  exportToPDF: jest.fn(),
  exportToDOC: jest.fn(),
}));

jest.mock('./components/TeamLeaderboard', () => ({
  __esModule: true,
  default: ({ teamMetrics }: any) => (
    <div data-testid="team-leaderboard">
      Team Leaderboard - {teamMetrics.length} teams
    </div>
  ),
}));

jest.mock('./components/MembersLeaderboard', () => ({
  __esModule: true,
  default: ({ session, sortedData }: any) => (
    <div data-testid="members-leaderboard">
      Members Leaderboard - {session?.title} - {sortedData.length} members
    </div>
  ),
}));

jest.mock('./components/ContributionsModal', () => ({
  __esModule: true,
  default: ({ selectedUser, setIsModalOpen }: any) => (
    <div data-testid="contributions-modal">
      Contributions Modal - {selectedUser?.userName}
      <button onClick={() => setIsModalOpen(false)}>Close Modal</button>
    </div>
  ),
}));

jest.mock('../../components/LoadingOverlay', () => ({
  LoadingOverlay: ({ message }: { message?: string }) => (
    <div data-testid="loading-overlay">{message}</div>
  ),
}));

const mockFetchLeaderboardData = require('../../services/firestore/firestoreServices').fetchLeaderboardData;
const mockGetSession = require('../../services/firestore/firestoreServices').getSession;
const mockGetCardsBySessionId = require('../../services/firestore/firestoreServices').getCardsBySessionId;
const mockGetAvailableTeams = require('../../services/teamSelectionServices').getAvailableTeams;
const mockExportToPDF = require('../../services/leaderboardServices').exportToPDF;
const mockExportToDOC = require('../../services/leaderboardServices').exportToDOC;

// Mock do useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    sessionId: 'test-session-123',
  }),
}));

describe('LeaderboardScene', () => {
  const mockSession = {
    id: 'test-session-123',
    title: 'Test Session Session',
    description: 'Test description for session session',
    teams: {
      'user1': 'Time A',
      'user2': 'Time A',
      'user3': 'Time B',
    },
    numOfTeams: 2,
  };

  const mockLeaderboardData = [
    {
      userId: 'user1',
      userName: 'João Silva',
      totalComments: 10,
      totalReplies: 5,
      averageRating: 4.5,
      totalCardsCreated: 3,
    },
    {
      userId: 'user2',
      userName: 'Maria Santos',
      totalComments: 8,
      totalReplies: 3,
      averageRating: 4.2,
      totalCardsCreated: 2,
    },
  ];

  const mockCards = [
    {
      id: 'card1',
      text: 'Test card 1',
      teamName: 'Time A',
      createdBy: 'João Silva',
      createdById: 'user1',
      ratings: { user1: 5, user2: 4 },
      comments: [],
    },
    {
      id: 'card2',
      text: 'Test card 2',
      teamName: 'Time B',
      createdBy: 'Maria Santos',
      createdById: 'user2',
      ratings: { user1: 4, user2: 5 },
      comments: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAvailableTeams.mockReturnValue(['Time A', 'Time B']);

    mockFetchLeaderboardData.mockResolvedValue(mockLeaderboardData);
    mockGetSession.mockResolvedValue(mockSession);
    mockGetCardsBySessionId.mockResolvedValue(mockCards);
  });

  describe('Loading state', () => {
    it('should show LoadingOverlay when loading data', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('loading-overlay')).toHaveTextContent('Carregando tabela de classificação...');

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });
    });
  });

  describe('Main content rendering', () => {
    it('should render leaderboard content after loading', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Tabela de Classificação')).toBeInTheDocument();
      expect(screen.getByText('Test Session Session')).toBeInTheDocument();
      expect(screen.getByText('Test description for session session')).toBeInTheDocument();
    });

    it('should render export buttons', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Exportar PDF')).toBeInTheDocument();
      expect(screen.getByText('Exportar DOC')).toBeInTheDocument();
    });

    it('should render tab navigation', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('👥 Participantes')).toBeInTheDocument();
      expect(screen.getByText('🏆 Times')).toBeInTheDocument();
    });
  });

  describe('Tab functionality', () => {
    it('should show participants tab by default', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('members-leaderboard')).toBeInTheDocument();
    });

    it('should switch to teams tab when clicked', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const teamsTab = screen.getByText('🏆 Times');
      fireEvent.click(teamsTab);

      expect(screen.getByTestId('team-leaderboard')).toBeInTheDocument();
    });

    it('should switch back to participants tab', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Go to teams tab first
      const teamsTab = screen.getByText('🏆 Times');
      fireEvent.click(teamsTab);
      expect(screen.getByTestId('team-leaderboard')).toBeInTheDocument();

      // Go back to participants tab
      const participantsTab = screen.getByText('👥 Participantes');
      fireEvent.click(participantsTab);
      expect(screen.getByTestId('members-leaderboard')).toBeInTheDocument();
    });
  });

  describe('Export functionality', () => {
    it('should call exportToPDF when PDF export button is clicked', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const pdfButton = screen.getByText('Exportar PDF');
      fireEvent.click(pdfButton);

      expect(mockExportToPDF).toHaveBeenCalledWith(
        mockSession,
        expect.any(Array), // teamMetrics
        expect.any(Array), // sortedData
        mockCards
      );
    });

    it('should call exportToDOC when DOC export button is clicked', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const docButton = screen.getByText('Exportar DOC');
      fireEvent.click(docButton);

      expect(mockExportToDOC).toHaveBeenCalledWith(
        mockSession,
        expect.any(Array), // teamMetrics
        expect.any(Array), // sortedData
        mockCards
      );
    });
  });

  describe('Refresh functionality', () => {
    it('should reload data when refresh button is clicked', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Atualizar Tabela');
      fireEvent.click(refreshButton);

      // Should show loading again
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(mockFetchLeaderboardData).toHaveBeenCalledTimes(2);
      expect(mockGetSession).toHaveBeenCalledTimes(2);
      expect(mockGetCardsBySessionId).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling', () => {
    it('should handle errors when loading data fails', async () => {
      mockFetchLeaderboardData.mockRejectedValue(new Error('Failed to fetch data'));

      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Should still render the basic structure even if data loading fails
      expect(screen.getByText('Tabela de Classificação')).toBeInTheDocument();
    });

    it('should handle missing session data', async () => {
      mockGetSession.mockResolvedValue(null);

      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Sessão de levantamento de requisitos')).toBeInTheDocument();
    });
  });

  describe('Data processing', () => {
    it('should calculate team metrics correctly', async () => {
      render(
        <BrowserRouter>
          <LeaderboardScene />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });

      // Verify that getAvailableTeams was called with correct number of teams
      expect(mockGetAvailableTeams).toHaveBeenCalledWith(2);

      // Switch to teams tab to trigger team metrics display
      const teamsTab = screen.getByText('🏆 Times');
      fireEvent.click(teamsTab);

      expect(screen.getByTestId('team-leaderboard')).toBeInTheDocument();
    });
  });
});