import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Applications from '../pages/Applications';

vi.mock('../services/applicationService', () => ({
  getApplications: vi.fn(),
  createApplication: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
}));

import { getApplications } from '../services/applicationService';

describe('Applications page rendering', () => {
  it('renders a loading state, then the empty state when there are no applications', async () => {
    getApplications.mockResolvedValueOnce({
      data: { applications: [], pagination: { total: 0, page: 1, totalPages: 1 } },
    });

    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no applications found/i)).toBeInTheDocument();
    });
  });

  it('renders a list of applications returned from the API', async () => {
    getApplications.mockResolvedValueOnce({
      data: {
        applications: [
          {
            _id: '1',
            company: 'Stripe',
            position: 'Frontend Engineer Intern',
            jobType: 'Internship',
            status: 'Applied',
            applicationDate: new Date().toISOString(),
          },
        ],
        pagination: { total: 1, page: 1, totalPages: 1 },
      },
    });

    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Stripe')).toBeInTheDocument();
      expect(screen.getByText('Frontend Engineer Intern')).toBeInTheDocument();
    });
  });

  it('renders an error state when the API call fails', async () => {
    getApplications.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } });

    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });
});
