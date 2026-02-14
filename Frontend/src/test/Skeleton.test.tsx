import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, CardSkeleton, TableSkeleton } from '../components/Skeleton';

describe('Skeleton Components', () => {
  it('renders basic skeleton', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders card skeleton', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders table skeleton', () => {
    const { container } = render(<TableSkeleton rows={3} cols={4} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

