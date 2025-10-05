import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import JoinScene from "./JoinScene";

// Mock do hook useRefinementJoin
const mockUseRefinementJoin = jest.fn();

// Mock do react-router-dom
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock("../../hooks/useRefinimentJoin", () => ({
  useRefinementJoin: () => mockUseRefinementJoin(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

// Mock dos componentes
jest.mock("../../components/Button", () => ({
  Button: ({ children, onClick, disabled, loading, variant, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      data-testid={`button-${variant || 'primary'}`}
    >
      {loading ? "Carregando..." : children}
    </button>
  ),
}));

jest.mock("../../components/LoadingSpinner", () => ({
  LoadingSpinner: ({ size, color, className }: any) => (
    <div
      data-testid="loading-spinner"
      className={`${size} ${color} ${className}`}
    >
      Loading...
    </div>
  ),
}));

// Wrapper component para fornecer o Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("JoinScene", () => {
  // Mock values padrão
  const defaultMockValues = {
    isJoining: false,
    error: null,
    requiresPassword: false,
    refinementData: null,
    joinSession: jest.fn(),
    resetPasswordState: jest.fn(),
    resetError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRefinementJoin.mockReturnValue(defaultMockValues);
    mockUseParams.mockReturnValue({ sessionCode: undefined });
  });

  // Teste 1: Renderização básica - tela de código
  it("should render join scene with code input", () => {
    renderWithRouter(<JoinScene />);

    expect(screen.getByText("Entrar em uma Sessão")).toBeInTheDocument();
    expect(screen.getByText("Junte-se a uma sessão de refinamento existente")).toBeInTheDocument();
    expect(screen.getByLabelText(/código da sessão \*/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /participar/i })).toBeInTheDocument();
    expect(screen.getByText("Sessões recentes:")).toBeInTheDocument();
  });

  // Teste 2: Renderização com sessionCode nos parâmetros
  it("should prefill code when sessionCode is provided in URL", () => {
    mockUseParams.mockReturnValue({ sessionCode: "TEST123" });

    renderWithRouter(<JoinScene />);

    const codeInput = screen.getByLabelText(/código da sessão \*/i) as HTMLInputElement;
    expect(codeInput.value).toBe("TEST123");
  });

  // Teste 3: Tela de senha quando requiresPassword é true
  it("should render password screen when requiresPassword is true", () => {
    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      requiresPassword: true,
      refinementData: {
        title: "Sprint 15 Refinamento"
      }
    });

    renderWithRouter(<JoinScene />);

    expect(screen.getByText("Senha da Sessão")).toBeInTheDocument();
    expect(screen.getByText('A sessão "Sprint 15 Refinamento" é protegida por senha')).toBeInTheDocument();
    expect(screen.getByLabelText(/senha da sessão \*/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voltar ao código/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verificar senha/i })).toBeInTheDocument();
  });

  // Teste 4: Botão participar desabilitado quando código está vazio
  it("should disable join button when code is empty", () => {
    renderWithRouter(<JoinScene />);

    const joinButton = screen.getByRole("button", { name: /participar/i });
    expect(joinButton).toBeDisabled();
  });

  // Teste 5: Botão participar habilitado quando código está preenchido
  it("should enable join button when code is filled", () => {
    mockUseParams.mockReturnValue({ sessionCode: "TEST123" });

    renderWithRouter(<JoinScene />);

    const joinButton = screen.getByRole("button", { name: /participar/i });
    expect(joinButton).toBeEnabled();
  });

  // Teste 6: Botão verificar senha desabilitado quando senha está vazia
  it("should disable verify password button when password is empty", () => {
    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      requiresPassword: true,
    });

    renderWithRouter(<JoinScene />);

    const verifyButton = screen.getByRole("button", { name: /verificar senha/i });
    expect(verifyButton).toBeDisabled();
  });

  // Teste 7: Digitação no campo de código
  it("should update code when typing", async () => {
    const user = userEvent.setup();

    renderWithRouter(<JoinScene />);

    const codeInput = screen.getByLabelText(/código da sessão \*/i);
    await user.type(codeInput, "NEWCODE");

    expect(codeInput).toHaveValue("NEWCODE");
  });

  // Teste 8: Digitação no campo de senha
  it("should update password when typing", async () => {
    const user = userEvent.setup();

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      requiresPassword: true,
    });

    renderWithRouter(<JoinScene />);

    const passwordInput = screen.getByLabelText(/senha da sessão \*/i);
    await user.type(passwordInput, "mypassword");

    expect(passwordInput).toHaveValue("mypassword");
  });

  // Teste 9: Quick join com sessões recentes
  it("should fill code when quick join button is clicked", async () => {
    const user = userEvent.setup();

    renderWithRouter(<JoinScene />);

    const quickJoinButton = screen.getByRole("button", { name: "TEAM123" });
    await user.click(quickJoinButton);

    const codeInput = screen.getByLabelText(/código da sessão \*/i);
    expect(codeInput).toHaveValue("TEAM123");
  });

  // Teste 10: Reset de erro ao digitar no código
  it("should reset error when typing in code input", async () => {
    const user = userEvent.setup();
    const mockResetError = jest.fn();

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      resetError: mockResetError,
    });

    renderWithRouter(<JoinScene />);

    const codeInput = screen.getByLabelText(/código da sessão \*/i);
    await user.type(codeInput, "A");

    expect(mockResetError).toHaveBeenCalled();
  });

  // Teste 11: Reset de erro ao digitar na senha
  it("should reset error when typing in password input", async () => {
    const user = userEvent.setup();
    const mockResetError = jest.fn();

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      requiresPassword: true,
      resetError: mockResetError,
    });

    renderWithRouter(<JoinScene />);

    const passwordInput = screen.getByLabelText(/senha da sessão \*/i);
    await user.type(passwordInput, "A");

    expect(mockResetError).toHaveBeenCalled();
  });

  // Teste 12: Navegação ao voltar na tela de código
  it("should navigate to home when back button is clicked in code screen", async () => {
    const user = userEvent.setup();

    renderWithRouter(<JoinScene />);

    const backButton = screen.getByRole("button", { name: /voltar/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Teste 13: Reset password state ao voltar na tela de senha
  it("should reset password state when back button is clicked in password screen", async () => {
    const user = userEvent.setup();
    const mockResetPasswordState = jest.fn();

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      requiresPassword: true,
      resetPasswordState: mockResetPasswordState,
    });

    renderWithRouter(<JoinScene />);

    const backButton = screen.getByRole("button", { name: /voltar ao código/i });
    await user.click(backButton);

    expect(mockResetPasswordState).toHaveBeenCalled();
  });

  // Teste 14: Tentativa de entrar na sessão com código
  it("should call joinSession when join button is clicked", async () => {
    const user = userEvent.setup();
    const mockJoinSession = jest.fn().mockResolvedValue({ success: true, refinementId: "123" });

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      joinSession: mockJoinSession,
    });

    mockUseParams.mockReturnValue({ sessionCode: "TEST123" });

    renderWithRouter(<JoinScene />);

    const joinButton = screen.getByRole("button", { name: /participar/i });
    await user.click(joinButton);

    expect(mockJoinSession).toHaveBeenCalledWith("TEST123", undefined);
  });

  // Teste 15: Tentativa de entrar na sessão com senha
  it("should call joinSession with password when verify button is clicked", async () => {
    const user = userEvent.setup();
    const mockJoinSession = jest.fn()
      .mockResolvedValueOnce({ requiresPassword: true }) // Primeira chamada pede senha
      .mockResolvedValueOnce({ success: true, refinementId: "123" }); // Segunda chamada com senha

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      joinSession: mockJoinSession,
    });

    mockUseParams.mockReturnValue({ sessionCode: "TEST123" });

    renderWithRouter(<JoinScene />);

    // Primeiro clique no botão participar (vai para tela de senha)
    const joinButton = screen.getByRole("button", { name: /participar/i });
    await user.click(joinButton);

    // Agora mocka o estado de requiresPassword true
    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      requiresPassword: true,
      refinementData: { title: "Test Session" },
      joinSession: mockJoinSession,
    });

    // Re-render para mostrar tela de senha
    renderWithRouter(<JoinScene />);

    const passwordInput = screen.getByLabelText(/senha da sessão \*/i);
    await user.type(passwordInput, "mypassword");

    const verifyButton = screen.getByRole("button", { name: /verificar senha/i });
    await user.click(verifyButton);

    expect(mockJoinSession).toHaveBeenCalledWith("TEST123", "mypassword");
  });

  // Teste 16: Navegação após sucesso no join
  it("should navigate to team selection after successful join", async () => {
    const user = userEvent.setup();
    const mockJoinSession = jest.fn().mockResolvedValue({
      success: true,
      refinementId: "123"
    });

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      joinSession: mockJoinSession,
    });

    mockUseParams.mockReturnValue({ sessionCode: "TEST123" });

    renderWithRouter(<JoinScene />);

    const joinButton = screen.getByRole("button", { name: /participar/i });
    await user.click(joinButton);

    expect(mockNavigate).toHaveBeenCalledWith("/team-selection/123");
  });

  // Teste 17: Exibição de mensagem de erro
  it("should display error message when error exists", () => {
    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      error: "Código inválido ou sessão não encontrada",
    });

    renderWithRouter(<JoinScene />);

    expect(screen.getByText("Código inválido ou sessão não encontrada")).toBeInTheDocument();
  });

  // Teste 18: Estado de loading durante o join
  it("should show loading state when isJoining is true", () => {
    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      isJoining: true,
    });

    renderWithRouter(<JoinScene />);

    expect(screen.getByText("Entrando na sessão...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  // Teste 19: Estado de loading durante verificação de senha
  it("should show loading state for password verification", () => {
    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      isJoining: true,
      requiresPassword: true,
    });

    renderWithRouter(<JoinScene />);

    expect(screen.getByText("Verificando senha...")).toBeInTheDocument();
  });

  // Teste 20: Enter key para submeter formulário
  it("should submit form when Enter key is pressed", async () => {
    const user = userEvent.setup();
    const mockJoinSession = jest.fn().mockResolvedValue({ success: true, refinementId: "123" });

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      joinSession: mockJoinSession,
    });

    renderWithRouter(<JoinScene />);

    const codeInput = screen.getByLabelText(/código da sessão \*/i);
    await user.type(codeInput, "TEST123{Enter}");

    expect(mockJoinSession).toHaveBeenCalledWith("TEST123", undefined);
  });

  // Teste 21: Enter key para submeter senha
  it("should submit password when Enter key is pressed", async () => {
    const user = userEvent.setup();
    const mockJoinSession = jest.fn().mockResolvedValue({ success: true, refinementId: "123" });

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      requiresPassword: true,
      joinSession: mockJoinSession,
    });

    renderWithRouter(<JoinScene />);

    const passwordInput = screen.getByLabelText(/senha da sessão \*/i);
    await user.type(passwordInput, "mypassword{Enter}");

    expect(mockJoinSession).toHaveBeenCalledWith("", "mypassword");
  });

  // Teste 22: Não navegar quando requiresPassword é true
  it("should not navigate when joinSession returns requiresPassword true", async () => {
    const user = userEvent.setup();
    const mockJoinSession = jest.fn().mockResolvedValue({
      requiresPassword: true
    });

    mockUseRefinementJoin.mockReturnValue({
      ...defaultMockValues,
      joinSession: mockJoinSession,
    });

    mockUseParams.mockReturnValue({ sessionCode: "TEST123" });

    renderWithRouter(<JoinScene />);

    const joinButton = screen.getByRole("button", { name: /participar/i });
    await user.click(joinButton);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});