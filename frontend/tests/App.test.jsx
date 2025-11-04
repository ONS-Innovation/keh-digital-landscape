import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

describe('App', () => {
  it('renders the Home page by default', () => {
    // Mock the ProtectedRoute component
    vi.mock('../src/components/ProtectedRoute/ProtectedRoute', () => ({
      default: ({ children, requiredRoles }) => {
        // Simulate role-checking logic
        const userRoles = ['reviewer']; // Mock user roles
        const hasAccess = requiredRoles.every(role => userRoles.includes(role));
        return hasAccess ? children : <div>Access Denied</div>;
      },
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Check if the Home page content is rendered
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });
});
