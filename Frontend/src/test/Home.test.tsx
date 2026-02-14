import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

describe('Home Page', () => {
  it('renders the home page with title', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText('Police Case Management System')).toBeInTheDocument();
  });

  it('displays feature cards', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText('Case Management')).toBeInTheDocument();
    expect(screen.getByText('Detective Board')).toBeInTheDocument();
    expect(screen.getByText('Active Pursuits')).toBeInTheDocument();
  });

  it('has a get started button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});