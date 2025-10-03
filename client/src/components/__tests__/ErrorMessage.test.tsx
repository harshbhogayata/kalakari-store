import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders with default props', () => {
    render(<ErrorMessage />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We encountered an error while loading this content. Please try again.')).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <ErrorMessage
        title="Custom Error"
        message="Custom error message"
      />
    );
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = jest.fn();
    
    render(
      <ErrorMessage
        onRetry={onRetry}
      />
    );
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows home button when showHomeButton is true', () => {
    render(
      <ErrorMessage
        showHomeButton={true}
      />
    );
    
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<ErrorMessage />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ErrorMessage
        className="custom-class"
      />
    );
    
    const container = screen.getByText('Something went wrong').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});
