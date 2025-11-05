import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import LoginScene from './LoginScene';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

jest.mock('@/components/Button', () => ({
  Button: jest.fn(({
    children,
    onClick,
    loading,
    disabled,
    type = 'button',
    variant = 'primary',
    className,
    ...props
  }: any) => {
    let testId = `button-${variant}`;

    const childrenText = Array.isArray(children)
      ? children.map(child => typeof child === 'string' ? child : '').join('')
      : String(children || '');

    if (childrenText.includes('Google')) {
      testId = 'button-google';
    } else if (childrenText.includes('Anônimo')) {
      testId = 'button-anonymous';
    } else if (childrenText.includes('Entrar')) {
      testId = 'button-submit';
    }

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={className}
        data-variant={variant}
        data-loading={loading}
        data-testid={testId}
        {...props}
      >
        {loading ? 'Carregando...' : children}
      </button>
    );
  }),
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('LoginScene', () => {
  const mockNavigate = jest.fn();
  const mockSignIn = jest.fn();
  const mockSignInAnonymously = jest.fn();
  const mockSignInWithGoogle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const { useNavigate } = require('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);

    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signInAnonymously: mockSignInAnonymously,
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      anonymousUser: null,
    });
  });

  it('should render login form correctly', () => {
    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('Acesse sua conta para continuar')).toBeInTheDocument();
    expect(screen.getByText('Continuar com Google')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('Continuar como Anônimo')).toBeInTheDocument();
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument();
  });

  it('should handle successful email/password login', async () => {
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(toast.success).toHaveBeenCalledWith('Login realizado com sucesso!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should handle email/password login error', async () => {
    const errorMessage = 'Credenciais inválidas';
    mockSignIn.mockRejectedValueOnce(new Error(errorMessage));

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should handle successful Google login', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({ user: { displayName: 'Google User' } });

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    fireEvent.click(screen.getByText('Continuar com Google'));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Login realizado com Google!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should handle Google login error', async () => {
    const errorMessage = 'Erro de autenticação do Google';
    mockSignInWithGoogle.mockRejectedValueOnce(new Error(errorMessage));

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    fireEvent.click(screen.getByText('Continuar com Google'));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should handle successful anonymous login', async () => {
    mockSignInAnonymously.mockResolvedValueOnce(undefined);

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    fireEvent.click(screen.getByText('Continuar como Anônimo'));

    await waitFor(() => {
      expect(mockSignInAnonymously).toHaveBeenCalledWith('Usuário Anônimo');
      expect(toast.success).toHaveBeenCalledWith('Sessão anônima iniciada!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should handle anonymous login error', async () => {
    mockSignInAnonymously.mockRejectedValueOnce(new Error('Erro anônimo'));

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    fireEvent.click(screen.getByText('Continuar como Anônimo'));

    await waitFor(() => {
      expect(mockSignInAnonymously).toHaveBeenCalledWith('Usuário Anônimo');
      expect(toast.error).toHaveBeenCalledWith('Erro ao criar sessão anônima');
    });
  });

  it('should disable submit button when form is invalid', () => {
    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password' }
    });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password' }
    });
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state during email/password login', async () => {
    let resolveLogin: (value?: any) => void;
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve;
    });
    mockSignIn.mockReturnValue(loginPromise);

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      const submitButton = screen.getByTestId('button-submit');
      expect(submitButton).toHaveTextContent('Carregando...');
      expect(submitButton).toBeDisabled();
    });

    await act(async () => {
      resolveLogin!();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });
  });

  it('should show loading state during Google login', async () => {
    let resolveGoogleLogin: (value?: any) => void;
    const googlePromise = new Promise<void>((resolve) => {
      resolveGoogleLogin = resolve;
    });
    mockSignInWithGoogle.mockReturnValue(googlePromise);

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    const googleButton = screen.getByTestId('button-google');
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveTextContent('Continuar com Google');

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).toHaveTextContent('Carregando...');
      expect(googleButton).toBeDisabled();
    });

    const anonymousButton = screen.getByTestId('button-anonymous');
    expect(anonymousButton).toHaveTextContent('Continuar como Anônimo');
    expect(anonymousButton).not.toBeDisabled();

    await act(async () => {
      resolveGoogleLogin!();
    });

    await waitFor(() => {
      expect(googleButton).toHaveTextContent('Continuar com Google');
      expect(googleButton).not.toBeDisabled();
    });
  });

  it('should redirect to name-entry when anonymous user has no display name', async () => {
    const mockUser = { displayName: null, email: 'test@example.com' };

    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signInAnonymously: mockSignInAnonymously,
      signInWithGoogle: mockSignInWithGoogle,
      user: mockUser,
      anonymousUser: mockUser,
    });

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/name-entry');
    });
  });

  it('should not redirect when there is no anonymous user', async () => {
    const mockUser = { displayName: 'Regular User', email: 'test@example.com' };

    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signInAnonymously: mockSignInAnonymously,
      signInWithGoogle: mockSignInWithGoogle,
      user: mockUser,
      anonymousUser: null,
    });

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith('/name-entry');
    });
  });

  it('should not call signIn when form is submitted with empty fields', async () => {
    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    const submitButton = screen.getByTestId('button-submit');
    expect(submitButton).toBeDisabled();

    fireEvent.click(submitButton);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should render Google icon in Google sign-in button', () => {
    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    const googleButton = screen.getByText('Continuar com Google');
    const googleIcon = googleButton.querySelector('svg');

    expect(googleIcon).toBeInTheDocument();
    expect(googleIcon).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('should render separators between login options', () => {
    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    const separators = screen.getAllByText(/ou/);
    expect(separators).toHaveLength(2);
    expect(screen.getByText('ou entre com email')).toBeInTheDocument();
  });

  it('should have correct link to register page', () => {
    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    const registerLink = screen.getByText('Cadastre-se');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should show generic error message when no specific message', async () => {
    mockSignIn.mockRejectedValueOnce({});

    render(<BrowserRouter><LoginScene /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao fazer login');
    });
  });
});