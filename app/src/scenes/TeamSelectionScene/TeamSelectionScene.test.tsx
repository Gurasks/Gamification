import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import TeamSelectionScene from './TeamSelectionScene';
import { useUser } from '../../components/UserContext';
import { createUnsubscribeMembers } from '../../hooks/firestoreUnsubscriber';
import { startRefinementInFirebase, removeUserFromRefinement, deleteRefinement } from '../../services/firestoreServices';

// Mock das dependências
jest.mock('../../components/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('../../hooks/firestoreUnsubscriber', () => ({
  createUnsubscribeMembers: jest.fn(),
}));

jest.mock('../../services/firestoreServices', () => ({
  startRefinementInFirebase: jest.fn(),
  updateNumOfTeamsToRefinementInFirebase: jest.fn(),
  updateSelectionMethodToRefinementInFirebase: jest.fn(),
  removeUserFromRefinement: jest.fn(),
  deleteRefinement: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock dos componentes filhos
jest.mock('./components/OwnerTeamAssignment', () => {
  return function MockOwnerTeamAssignment() {
    return <div data-testid="owner-team-assignment">Owner Team Assignment</div>;
  };
});

jest.mock('./components/SelectionMethodChooser', () => {
  return function MockSelectionMethodChooser({ onMethodChange }: { onMethodChange: (method: string) => void }) {
    return (
      <div data-testid="selection-method-chooser">
        <button onClick={() => onMethodChange('RANDOM')}>Change to Random</button>
        <button onClick={() => onMethodChange('OWNER_CHOOSES')}>Change to Owner Chooses</button>
      </div>
    );
  };
});

jest.mock('./components/TeamSelection', () => {
  return function MockTeamSelection() {
    return <div data-testid="team-selection">Team Selection Component</div>;
  };
});

jest.mock('../../components/ShareButton', () => {
  return function MockShareButton() {
    return <button data-testid="share-button">Share</button>;
  };
});

jest.mock('../../components/CollapsibleDescriptionArea', () => {
  return function MockCollapsibleDescriptionArea({
    refinementDescription,
    showDescription,
    setShowDescription
  }: {
    refinementDescription: string;
    showDescription: boolean;
    setShowDescription: (show: boolean) => void;
  }) {
    return (
      <div data-testid="collapsible-description">
        <p>{refinementDescription}</p>
        <button onClick={() => setShowDescription(!showDescription)}>
          {showDescription ? 'Hide' : 'Show'} Description
        </button>
      </div>
    );
  };
});

jest.mock('../../components/ExitConfirmationModal', () => {
  return function MockExitConfirmationModal({
    isOpen,
    onClose,
    onConfirm
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="exit-confirmation-modal">
        <p>Exit Confirmation Modal</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm Exit</button>
      </div>
    );
  };
});

// Interface para o refinement mock
interface MockRefinement {
  id: string;
  title: string;
  description: string;
  numOfTeams: number;
  selectionMethod: 'RANDOM' | 'OWNER_CHOOSES';
  owner: string;
  members: Array<{ id: string; name: string; email: string }>;
  teams: Record<string, string>;
  hasStarted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

describe('TeamSelectionScene', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockRefinement: MockRefinement = {
    id: 'refinement-123',
    title: 'Test Refinement Session',
    description: 'This is a test refinement session',
    numOfTeams: 2,
    selectionMethod: 'RANDOM',
    owner: 'user-123',
    members: [mockUser],
    teams: {},
    hasStarted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockNavigate = jest.fn();
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock do useParams
    const { useParams } = require('react-router-dom');
    useParams.mockReturnValue({ refinementId: 'refinement-123' });

    // Mock do useNavigate
    const { useNavigate } = require('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);

    // Mock do useUser
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    // Mock do createUnsubscribeMembers
    (createUnsubscribeMembers as jest.Mock).mockReturnValue(mockUnsubscribe);
  });

  it('should render loading state initially', () => {
    (createUnsubscribeMembers as jest.Mock).mockImplementation(() => {
      // Não chama setRefinement para simular estado de carregamento
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    expect(screen.getByText('Carregando sessão...')).toBeInTheDocument();
    expect(screen.getByText(/Carregando sessão/)).toBeInTheDocument();
  });

  it('should render the team selection scene with refinement data', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      _refinementId: string,
      _user: typeof mockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: Array<{ id: string; name: string; email: string }>) => void
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(true);
      setNumOfTeams(2);
      setOwner('user-123');
      setMembers([mockUser]);
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    // Simula o carregamento dos dados
    await act(async () => {
      setRefinementCallback(mockRefinement);
    });

    await waitFor(() => {
      expect(screen.getByText('Configuração dos Times')).toBeInTheDocument();
      expect(screen.getByText('Test Refinement Session')).toBeInTheDocument();
      expect(screen.getByText('Organize os participantes e configure os times para o refinamento')).toBeInTheDocument();
    });

    expect(screen.getByTestId('share-button')).toBeInTheDocument();
    expect(screen.getByText('Sair da Sala')).toBeInTheDocument();
    expect(screen.getByText('Quantidade de Times')).toBeInTheDocument();
    expect(screen.getByTestId('selection-method-chooser')).toBeInTheDocument();
    expect(screen.getByTestId('team-selection')).toBeInTheDocument();
  });

  it('should show owner-specific elements when user is owner', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      _refinementId: string,
      _user: typeof mockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: Array<{ id: string; name: string; email: string }>) => void
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(true);
      setNumOfTeams(2);
      setOwner('user-123');
      setMembers([mockUser]);
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await act(async () => {
      setRefinementCallback(mockRefinement);
    });

    await waitFor(() => {
      expect(screen.getByText('Você é o organizador desta sessão')).toBeInTheDocument();
      expect(screen.getByText('Iniciar Refinamento')).toBeInTheDocument();
    });

    // Verifica se o input de quantidade de times está presente para o owner
    const teamNumberInput = screen.getByDisplayValue('2');
    expect(teamNumberInput).toBeInTheDocument();
  });

  it('should show participant view when user is not owner', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      _refinementId: string,
      _user: typeof mockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: Array<{ id: string; name: string; email: string }>) => void
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(false);
      setNumOfTeams(2);
      setOwner('other-user-123');
      setMembers([mockUser, { id: 'other-user-123', name: 'Other User', email: 'other@example.com' }]);
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await act(async () => {
      setRefinementCallback(mockRefinement);
    });

    await waitFor(() => {
      expect(screen.getByText('Aguardando configuração do organizador')).toBeInTheDocument();
      expect(screen.getByText('Aguardando o organizador iniciar a sessão')).toBeInTheDocument();
    });

    // Verifica se o botão de iniciar refinamento não está presente
    expect(screen.queryByText('Iniciar Refinamento')).not.toBeInTheDocument();
  });

  it('should handle exit room for participant', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      _refinementId: string,
      _user: typeof mockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: Array<{ id: string; name: string; email: string }>) => void
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(false);
      setNumOfTeams(2);
      setOwner('other-user-123');
      setMembers([mockUser]);
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await act(async () => {
      setRefinementCallback(mockRefinement);
    });

    // Abre o modal de confirmação
    const exitButton = screen.getByText('Sair da Sala');
    fireEvent.click(exitButton);

    await waitFor(() => {
      expect(screen.getByTestId('exit-confirmation-modal')).toBeInTheDocument();
    });

    // Confirma a saída
    const confirmButton = screen.getByText('Confirm Exit');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(removeUserFromRefinement).toHaveBeenCalledWith('refinement-123', 'user-123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should handle exit room for owner', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      _refinementId: string,
      _user: typeof mockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: Array<{ id: string; name: string; email: string }>) => void
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(true);
      setNumOfTeams(2);
      setOwner('user-123');
      setMembers([mockUser]);
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await act(async () => {
      setRefinementCallback(mockRefinement);
    });

    // Abre o modal de confirmação
    const exitButton = screen.getByText('Sair da Sala');
    fireEvent.click(exitButton);

    await waitFor(() => {
      expect(screen.getByTestId('exit-confirmation-modal')).toBeInTheDocument();
    });

    // Confirma a saída
    const confirmButton = screen.getByText('Confirm Exit');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteRefinement).toHaveBeenCalledWith('refinement-123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should start refinement when owner clicks start button', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    const refinementWithTeams: MockRefinement = {
      ...mockRefinement,
      teams: { 'user-123': 'Time 1' },
      members: [mockUser]
    };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      _refinementId: string,
      _user: typeof mockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: Array<{ id: string; name: string; email: string }>) => void
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(true);
      setNumOfTeams(2);
      setOwner('user-123');
      setMembers([mockUser]);
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await act(async () => {
      setRefinementCallback(refinementWithTeams);
    });

    const startButton = screen.getByText('Iniciar Refinamento');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(startRefinementInFirebase).toHaveBeenCalledWith(
        refinementWithTeams,
        'refinement-123',
        mockUser,
        mockNavigate
      );
    });
  });

  it('should show collapsible description when refinement has description', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      _refinementId: string,
      _user: typeof mockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: Array<{ id: string; name: string; email: string }>) => void
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(true);
      setNumOfTeams(2);
      setOwner('user-123');
      setMembers([mockUser]);
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await act(async () => {
      setRefinementCallback(mockRefinement);
    });

    await waitFor(() => {
      expect(screen.getByTestId('collapsible-description')).toBeInTheDocument();
      expect(screen.getByText('This is a test refinement session')).toBeInTheDocument();
    });
  });

  it('should cleanup unsubscribe on unmount', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      _refinementId: string,
      _user: typeof mockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: Array<{ id: string; name: string; email: string }>) => void
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(true);
      setNumOfTeams(2);
      setOwner('user-123');
      setMembers([mockUser]);
      return mockUnsubscribe;
    });

    const { unmount } = render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await act(async () => {
      setRefinementCallback(mockRefinement);
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});