import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import CreationScene from "./CreationScene";

// Mock simplificado do hook - evita problemas de importação
const mockUseRefinementCreation = jest.fn();

jest.mock("../../hooks/useRefinementCreation", () => ({
  useRefinementCreation: () => mockUseRefinementCreation(),
}));

// Mock do react-router-dom simplificado
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock do react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Wrapper component para fornecer o Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("CreationScene", () => {
  // Mock values padrão
  const defaultMockValues = {
    formData: {
      name: "",
      description: "",
      password: "",
      requiresPassword: false,
    },
    isCreating: false,
    handleCreateRefinement: jest.fn(),
    updateFormData: jest.fn(),
    validateForm: jest.fn(() => []),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRefinementCreation.mockReturnValue(defaultMockValues);
  });

  // Teste 1: Renderização básica
  it("should render creation scene with all elements", () => {
    renderWithRouter(<CreationScene />);

    expect(screen.getByText("Criar Nova Sessão")).toBeInTheDocument();
    expect(
      screen.getByText("Configure uma nova sessão de refinamento para sua equipe")
    ).toBeInTheDocument();

    // Campos de input
    expect(screen.getByLabelText(/nome da sessão \*/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/descrição do que será refinado/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/proteger sessão com senha/i)).toBeInTheDocument();

    // Botões
    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /criar sessão/i })
    ).toBeInTheDocument();
  });

  // Teste 2: Validação de formulário
  it("should disable create button when form is invalid", () => {
    renderWithRouter(<CreationScene />);

    const createButton = screen.getByRole("button", { name: /criar sessão/i });
    expect(createButton).toBeDisabled();
  });

  // Teste 3: Habilitar botão quando formulário é válido
  it("should enable create button when form is valid", () => {
    mockUseRefinementCreation.mockReturnValue({
      ...defaultMockValues,
      formData: {
        name: "Sprint 15 - Refinamento",
        description: "Descrição teste",
        password: "",
        requiresPassword: false,
      },
    });

    renderWithRouter(<CreationScene />);

    const createButton = screen.getByRole("button", { name: /criar sessão/i });
    expect(createButton).toBeEnabled();
  });

  // Teste 4: Preenchimento do nome da sessão
  it("should update session name when typing", async () => {
    const user = userEvent.setup();
    const mockUpdateFormData = jest.fn();

    mockUseRefinementCreation.mockReturnValue({
      ...defaultMockValues,
      updateFormData: mockUpdateFormData,
    });

    renderWithRouter(<CreationScene />);

    const nameInput = screen.getByLabelText(/nome da sessão \*/i);
    await user.type(nameInput, "Test");

    expect(mockUpdateFormData).toHaveBeenCalledWith("name", "T");
    expect(mockUpdateFormData).toHaveBeenCalledWith("name", "e");
    expect(mockUpdateFormData).toHaveBeenCalledWith("name", "s");
    expect(mockUpdateFormData).toHaveBeenCalledWith("name", "t");
  });

  // Teste 5: Ativar proteção por senha
  it("should toggle password protection when switch is clicked", async () => {
    const user = userEvent.setup();
    const mockUpdateFormData = jest.fn();

    mockUseRefinementCreation.mockReturnValue({
      ...defaultMockValues,
      updateFormData: mockUpdateFormData,
    });

    renderWithRouter(<CreationScene />);

    const passwordSwitch = screen.getByTestId("password-protection-switch");
    await user.click(passwordSwitch);

    expect(mockUpdateFormData).toHaveBeenCalledWith("requiresPassword", true);
  });

  // Teste 6: Mostrar campos de senha quando proteção está ativa
  it("should show password fields when password protection is enabled", () => {
    mockUseRefinementCreation.mockReturnValue({
      ...defaultMockValues,
      formData: {
        ...defaultMockValues.formData,
        requiresPassword: true,
      },
    });

    renderWithRouter(<CreationScene />);

    expect(screen.getByLabelText(/senha da sessão \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha \*/i)).toBeInTheDocument();
  });

  // Teste 7: Loading state durante a criação
  it("should show loading state when creating", () => {
    mockUseRefinementCreation.mockReturnValue({
      ...defaultMockValues,
      formData: {
        name: "Sprint 15",
        description: "Descrição teste",
        password: "",
        requiresPassword: false,
      },
      isCreating: true,
    });

    renderWithRouter(<CreationScene />);

    // Encontra o botão pelo texto original e verifica se está desabilitado
    const createButton = screen.getByRole("button", { name: /criar sessão/i });
    expect(createButton).toBeDisabled();
    expect(createButton).toHaveTextContent("Criar Sessão");

    // Verifica se o spinner está presente (indicador de loading)
    const spinner = createButton.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  // Teste 8: Voltar para a página inicial
  it("should navigate to home when back button is clicked", async () => {
    const user = userEvent.setup();

    renderWithRouter(<CreationScene />);

    const backButton = screen.getByRole("button", { name: /voltar/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});