/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@/store/authStore';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the auth store
jest.mock('@/store/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Test component that simulates login flow
const LoginTestComponent = () => {
  const { login, isLoading, error, user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    await login(
      formData.get('email') as string,
      formData.get('password') as string
    );
  };

  if (user) {
    return <div>Logged in as {user.email}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Mot de passe" />
      {error && <div role="alert">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
      </button>
    </form>
  );
};

describe('Authentication Flow Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('renders login form initially', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      setUser: jest.fn(),
      setToken: jest.fn(),
    });

    render(<LoginTestComponent />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('shows loading state during login', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isLoading: true,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      setUser: jest.fn(),
      setToken: jest.fn(),
    });

    render(<LoginTestComponent />);

    expect(screen.getByRole('button', { name: /connexion en cours/i })).toBeDisabled();
  });

  it('displays error message on failed login', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      error: 'Email ou mot de passe incorrect',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      setUser: jest.fn(),
      setToken: jest.fn(),
    });

    render(<LoginTestComponent />);

    expect(screen.getByRole('alert')).toHaveTextContent(/email ou mot de passe incorrect/i);
  });

  it('shows logged in state after successful login', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARTICIPANT',
      },
      token: 'fake-jwt-token',
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      setUser: jest.fn(),
      setToken: jest.fn(),
    });

    render(<LoginTestComponent />);

    expect(screen.getByText(/logged in as test@example.com/i)).toBeInTheDocument();
  });

  it('calls login function with form data on submit', async () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      setUser: jest.fn(),
      setToken: jest.fn(),
    });

    const user = userEvent.setup();
    render(<LoginTestComponent />);

    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/mot de passe/i), 'password123');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});

// Test component for logout flow
const LogoutTestComponent = () => {
  const { logout, user } = useAuthStore();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <span>Welcome, {user.name}</span>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
};

describe('Logout Flow Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows logout button when logged in', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARTICIPANT',
      },
      token: 'fake-jwt-token',
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      setUser: jest.fn(),
      setToken: jest.fn(),
    });

    render(<LogoutTestComponent />);

    expect(screen.getByText(/welcome, test user/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se déconnecter/i })).toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', async () => {
    const mockLogout = jest.fn();
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARTICIPANT',
      },
      token: 'fake-jwt-token',
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
      clearError: jest.fn(),
      setUser: jest.fn(),
      setToken: jest.fn(),
    });

    const user = userEvent.setup();
    render(<LogoutTestComponent />);

    await user.click(screen.getByRole('button', { name: /se déconnecter/i }));

    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows not logged in state when user is null', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      setUser: jest.fn(),
      setToken: jest.fn(),
    });

    render(<LogoutTestComponent />);

    expect(screen.getByText(/not logged in/i)).toBeInTheDocument();
  });
});
