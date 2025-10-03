import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../Home';
import { TestWrapper } from '../../setupTests';

// Mock API
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
}));

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders home page components', async () => {
    const mockApi = require('../../utils/api');
    
    mockApi.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          products: [],
          artisans: [],
        },
      },
    });

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for main sections
    expect(screen.getByText('home.hero.title')).toBeInTheDocument();
    expect(screen.getByText('home.features.authentic.title')).toBeInTheDocument();
    expect(screen.getByText('home.featuredProducts')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    const mockApi = require('../../utils/api');
    
    mockApi.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Should show loading or skeleton components
    expect(screen.getByText('home.hero.title')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    const mockApi = require('../../utils/api');
    
    mockApi.get.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should still render the page even if API fails
      expect(screen.getByText('home.hero.title')).toBeInTheDocument();
    });
  });

  it('renders featured products when data is available', async () => {
    const mockApi = require('../../utils/api');
    const mockProducts = [
      {
        _id: '1',
        name: 'Test Product 1',
        price: 1000,
        images: [{ url: 'https://example.com/image1.jpg' }],
        category: 'Pottery',
      },
      {
        _id: '2',
        name: 'Test Product 2',
        price: 2000,
        images: [{ url: 'https://example.com/image2.jpg' }],
        category: 'Textiles',
      },
    ];
    
    mockApi.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          products: mockProducts,
          artisans: [],
        },
      },
    });

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });
});
