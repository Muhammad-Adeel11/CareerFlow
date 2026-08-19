import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationFormModal from '../components/ApplicationFormModal';

describe('ApplicationFormModal behavior', () => {
  it('does not render anything when open is false', () => {
    const { container } = render(
      <ApplicationFormModal open={false} initialData={null} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows validation errors when required fields are empty', async () => {
    const onSubmit = vi.fn();
    render(<ApplicationFormModal open initialData={null} onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/company/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /add application/i }));

    await waitFor(() => {
      expect(screen.getByText(/company is required/i)).toBeInTheDocument();
      expect(screen.getByText(/position is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form values when valid data is provided', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    render(<ApplicationFormModal open initialData={null} onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/company/i), { target: { value: 'Acme Corp' } });
    fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Software Engineer Intern' } });
    fireEvent.click(screen.getByRole('button', { name: /add application/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const submittedValues = onSubmit.mock.calls[0][0];
    expect(submittedValues.company).toBe('Acme Corp');
    expect(submittedValues.position).toBe('Software Engineer Intern');
  });

  it('pre-fills the form when editing an existing application', () => {
    const initialData = {
      company: 'Notion',
      position: 'Product Design Intern',
      applicationDate: new Date().toISOString(),
      status: 'Interview',
      jobType: 'Internship',
    };
    render(<ApplicationFormModal open initialData={initialData} onClose={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByDisplayValue('Notion')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Product Design Intern')).toBeInTheDocument();
  });
});
