import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/authService', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('no session')),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Register form validation', () => {
  it('shows validation errors when required fields are missing', async () => {
    renderRegister();

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows an error when password is too short', async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jordan Lee' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'jordan@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('shows an error when passwords do not match', async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jordan Lee' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'jordan@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Different123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
