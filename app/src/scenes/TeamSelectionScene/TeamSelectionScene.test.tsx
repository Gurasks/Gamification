import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeamSelectionScene from './TeamSelectionScene';
import { createUnsubscribeMembers } from '../../hooks/firestoreUnsubscriber';
import {
  startRefinementInFirebase,
  removeUserFromRefinement,
  deleteRefinement,
  updateNumOfTeamsToRefinementInFirebase,
  updateSelectionMethodToRefinementInFirebase
} from '../../services/firestore/firestoreServices';
import { useAuth } from '../../contexts/AuthContext';

// Mocks
jest.mock('../../hooks/firestoreUnsubscriber', () => ({
  createUnsubscribeMembers: jest.fn(),
}));

jest.mock('../../services/firestore/firestoreServices', () => ({
  startRefinementInFirebase: jest.fn(),
  updateNumOfTeamsToRefinementInFirebase: jest.fn(),
  updateSelectionMethodToRefinementInFirebase: jest.fn(),
  removeUserFromRefinement: jest.fn(),
  deleteRefinement: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
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
  return function MockSelectionMethodChooser({
    currentMethod,
    onMethodChange,
    isOwner
  }: {
    currentMethod: string;
    onMethodChange: (method: string) => void;
    isOwner: boolean;
  }) {
    return (
      <div data-testid="selection-method-chooser">
        <span>Current Method: {currentMethod}</span>
        <button onClick={() => onMethodChange('RANDOM')}>Change to Random</button>
        <button onClick={() => onMethodChange('OWNER_CHOOSES')}>Change to Owner Chooses</button>
        <span>Is Owner: {isOwner.toString()}</span>
      </div>
    );
  };
});

jest.mock('./components/TeamSelection', () => {
  return function MockTeamSelection({
    selectionMethod,
    availableTeams
  }: {
    selectionMethod: string;
    availableTeams: string[];
  }) {
    return (
      <div data-testid="team-selection">
        <span>Selection Method: {selectionMethod}</span>
        <span>Available Teams: {availableTeams.join(', ')}</span>
        Team Selection Component
      </div>
    );
  };
});

jest.mock('../../components/ShareButton', () => {
  return function MockShareButton({ refinementId, sessionTitle }: { refinementId: string; sessionTitle: string }) {
    return (
      <button data-testid="share-button">
        Share {sessionTitle} ({refinementId})
      </button>
    );
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

jest.mock('./components/ExitConfirmationModal', () => {
  return function MockExitConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isOwner,
    sessionTitle
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isOwner: boolean;
    sessionTitle: string;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="exit-confirmation-modal">
        <p>Exit Confirmation Modal - {sessionTitle}</p>
        <p>Is Owner: {isOwner.toString()}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm Exit</button>
      </div>
    );
  };
});

// Types
interface MockUser {
  uid: string;
  displayName: string;
  email: string;
}

interface MockRefinement {
  id: string;
  title: string;
  description: string;
  numOfTeams: number;
  selectionMethod: 'RANDOM' | 'OWNER_CHOOSES';
  owner: string;
  members: MockUser[];
  teams: Record<string, string>;
  hasStarted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

describe('TeamSelectionScene', () => {
  const mockUser: MockUser = {
    uid: 'user-123',
    displayName: 'Test User',
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

    // Mock do useAuth
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Mock do createUnsubscribeMembers
    (createUnsubscribeMembers as jest.Mock).mockReturnValue(mockUnsubscribe);
  });

  // Teste 1: Estado de carregamento inicial
  it('should render loading state initially when refinement is null', () => {
    (createUnsubscribeMembers as jest.Mock).mockImplementation(() => {
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    expect(screen.getByText('Carregando sessão...')).toBeInTheDocument();
  });

  // Teste 2: Carregamento de autenticação
  it('should render authentication loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    expect(screen.getByText('Carregando autenticação...')).toBeInTheDocument();
  });

  // Teste 3: Usuário não autenticado
  it('should show unauthorized access when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    expect(screen.getByText('Acesso não autorizado')).toBeInTheDocument();
    expect(screen.getByText('Você precisa estar logado para acessar esta página.')).toBeInTheDocument();
    expect(screen.getByText('Fazer Login')).toBeInTheDocument();
  });

  // Teste 4: Renderização completa com dados
  it('should render the team selection scene with refinement data', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
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
    expect(screen.getByText('Você é o organizador desta sessão')).toBeInTheDocument();
  });

  // Teste 5: Elementos específicos do owner
  it('should show owner-specific elements when user is owner', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
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
    expect(teamNumberInput).toHaveAttribute('type', 'number');
  });

  // Teste 6: Visualização do participante
  it('should show participant view when user is not owner', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(false);
      setNumOfTeams(2);
      setOwner('other-user-123');
      setMembers([mockUser, {
        uid: 'other-user-123',
        displayName: 'Other User',
        email: 'other@example.com'
      }]);
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

    // Verifica se mostra o número de times como texto (não input)
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('times')).toBeInTheDocument();
  });

  // Teste 7: Saída da sala como participante
  it('should handle exit room for participant', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
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

  // Teste 8: Saída da sala como owner
  it('should handle exit room for owner', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
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

  // Teste 9: Iniciar refinamento como owner
  it('should start refinement when owner clicks start button', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    const refinementWithTeams: MockRefinement = {
      ...mockRefinement,
      teams: { 'user-123': 'Time 1' },
      members: [mockUser]
    };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
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

  // Teste 10: Descrição recolhível
  it('should show collapsible description when refinement has description', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
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

  // Teste 11: Lista de participantes
  it('should display participants list correctly', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    const refinementWithMultipleMembers: MockRefinement = {
      ...mockRefinement,
      members: [
        mockUser,
        { uid: 'user-456', displayName: 'Another User', email: 'another@example.com' },
        { uid: 'user-789', displayName: 'Third User', email: 'third@example.com' }
      ],
      teams: {
        'user-123': 'Time 1',
        'user-456': 'Time 2'
      }
    };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
    ) => {
      setRefinementCallback = setRefinement;
      setAvailableTeams(['Time 1', 'Time 2']);
      setIsOwner(true);
      setNumOfTeams(2);
      setOwner('user-123');
      setMembers(refinementWithMultipleMembers.members);
      return mockUnsubscribe;
    });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await act(async () => {
      setRefinementCallback(refinementWithMultipleMembers);
    });

    await waitFor(() => {
      expect(screen.getByText('Lista de Participantes (3)')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Another User')).toBeInTheDocument();
      expect(screen.getByText('Third User')).toBeInTheDocument();
      expect(screen.getByText('Time 1')).toBeInTheDocument();
      expect(screen.getByText('Time 2')).toBeInTheDocument();
    });
  });

  // Teste 12: Cleanup no unmount
  it('should cleanup unsubscribe on unmount', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
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

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  // Teste 13: Cancelar saída da sala
  it('should cancel exit when user clicks cancel in modal', async () => {
    let setRefinementCallback: (refinement: MockRefinement) => void = () => { };

    (createUnsubscribeMembers as jest.Mock).mockImplementation((
      refinementId: string,
      user: MockUser,
      setRefinement: (refinement: MockRefinement) => void,
      setAvailableTeams: (teams: string[]) => void,
      setIsOwner: (isOwner: boolean) => void,
      setNumOfTeams: (num: number) => void,
      setOwner: (owner: string) => void,
      setMembers: (members: MockUser[]) => void,
      navigate: jest.Mock
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

    // Cancela a saída
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('exit-confirmation-modal')).not.toBeInTheDocument();
      expect(deleteRefinement).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // Teste 14: RefinementId ausente
  it('should handle missing refinementId', async () => {
    const { useParams } = require('react-router-dom');
    useParams.mockReturnValue({ refinementId: undefined });

    render(
      <BrowserRouter>
        <TeamSelectionScene />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Carregando sessão...')).toBeInTheDocument();
    });
  });
});