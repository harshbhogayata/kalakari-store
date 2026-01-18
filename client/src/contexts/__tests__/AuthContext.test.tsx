import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { TestWrapper } from '../../setupTests';

// Mock API
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const TestComponent = () => {
  const { user, loading, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.name : 'No User'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('loads user from localStorage on mount', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token');

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
  });

  it('handles login successfully', async () => {
    const mockApi = require('../../utils/api');
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
    };

    mockApi.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token',
        },
      },
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('handles logout', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token');

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  it('handles login error', async () => {
    const mockApi = require('../../utils/api');
    
    mockApi.post.mockRejectedValue({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
    });
  });
});
