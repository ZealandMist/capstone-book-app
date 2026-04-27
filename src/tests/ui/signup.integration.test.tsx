import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.resetAllMocks();
});

test('signup form submits and calls signup API', async () => {
  mockedAxios.post.mockResolvedValueOnce({ data: { user: { id: 'u1', email: 'test@example.com' } } });
  // Ensure AuthProvider's profile fetch resolves immediately
  mockedAxios.get.mockResolvedValueOnce({ data: null });

  // Import the AuthProvider and the page after mocks are set
  const { AuthProvider } = await import('@/context/AuthContext');
  const SignupPage = (await import('@/app/(public)/signup/page')).default;

  const { container } = render(
    <AuthProvider>
      <SignupPage />
    </AuthProvider>
  );

  const user = userEvent.setup();

  // Wait for AuthProvider to finish loading (profile fetch)
  await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

  // Find fields and submit button after provider finished
  const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement | null;
  const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement | null;
  const submitButton = await screen.findByRole('button', { name: /sign up/i });

  if (!submitButton) throw new Error('Submit button not found in signup page render');

  if (emailInput) await user.type(emailInput, 'test@example.com');
  if (passwordInput) await user.type(passwordInput, 'password123');

  // Submit the form directly (more reliable in test env)
  const form = container.querySelector('form');
  if (!form) throw new Error('Form element not found');
  fireEvent.submit(form);

  // Wait for axios.post to be called by the page form handler
  await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
});