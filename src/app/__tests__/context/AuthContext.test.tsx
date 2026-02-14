import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import axios from 'axios';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import '@testing-library/jest-dom';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>

function TestComponent() {
  const { user, logout } = useAuth();

  return(
    <>
    <div data-testid="username">{user?.username ?? "no-user"}</div>
    <button onClick={logout}>Logout</button>
    </>
  );
}

describe('AuthContext', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and sets user on mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { _id: "1", username: "Test User", email: "testuser@example.com" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("username")).toHaveTextContent("Test User")
    );
  });
  
  it('sets user to null if profile request fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("username")).toHaveTextContent("no-user")
    );
  });

  it('logs out and clears user', async () => {
     mockedAxios.get.mockResolvedValueOnce({
      data: { _id: "1", username: "Test User", email: "testuser@example.com" },
    });

    mockedAxios.post.mockResolvedValueOnce({});

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("username")).toHaveTextContent("Test User")
    );

    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('no-user');
    });
  });
});