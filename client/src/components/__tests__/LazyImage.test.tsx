import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LazyImage from '../LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('LazyImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders placeholder initially', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="test-class"
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        placeholder="https://example.com/placeholder.jpg"
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('calls onLoad when image loads', async () => {
    const onLoad = jest.fn();
    
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        onLoad={onLoad}
      />
    );

    // Simulate image load
    const img = screen.getByRole('img', { hidden: true });
    Object.defineProperty(img, 'complete', { value: true });
    Object.defineProperty(img, 'naturalHeight', { value: 100 });
    
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('calls onError when image fails to load', async () => {
    const onError = jest.fn();
    
    render(
      <LazyImage
        src="https://example.com/invalid.jpg"
        alt="Test image"
        onError={onError}
      />
    );

    // Simulate image error
    const img = screen.getByRole('img', { hidden: true });
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('shows error state when image fails to load', async () => {
    render(
      <LazyImage
        src="https://example.com/invalid.jpg"
        alt="Test image"
      />
    );

    // Simulate image error
    const img = screen.getByRole('img', { hidden: true });
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });
});
