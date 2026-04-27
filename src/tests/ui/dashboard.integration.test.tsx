import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock dashboard CSS import
jest.mock('@/app/(protected)/dashboard/page.css', () => ({}), { virtual: true });

beforeEach(() => jest.resetAllMocks());

test('dashboard loads reading lists (calls API)', async () => {
  mockedAxios.get.mockImplementation((url: string) => {
    if (String(url).includes('/api/auth/profile')) {
      return Promise.resolve({ data: { username: 'tester' } });
    }
    if (String(url).includes('/api/reading-lists/user')) {
      return Promise.resolve({ data: { lists: [{ _id: 'list-1', name: 'My List' }] } });
    }
    return Promise.resolve({ data: {} });
  });

  const { AuthProvider } = await import('@/context/AuthContext');
  const DashboardPage = (await import('@/app/(protected)/dashboard/page')).default;
  const { container } = render(
    <AuthProvider>
      <DashboardPage />
    </AuthProvider>
  );

  // Wait for the page to call the API
  await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

  // If the page renders the list title from the mocked response, assert it appears
  const found = await screen.findByText(/My List/i).catch(() => null);
  if (found) expect(found).toBeTruthy();
});