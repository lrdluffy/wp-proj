import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSpinner from '../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { container: smContainer } = render(<LoadingSpinner size="sm" />);
    const { container: mdContainer } = render(<LoadingSpinner size="md" />);
    const { container: lgContainer } = render(<LoadingSpinner size="lg" />);
    
    expect(smContainer.firstChild).toBeInTheDocument();
    expect(mdContainer.firstChild).toBeInTheDocument();
    expect(lgContainer.firstChild).toBeInTheDocument();
  });
});