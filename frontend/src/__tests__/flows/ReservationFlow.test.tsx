/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationModal } from '@/components/reservations';
import { Event, EventStatus } from '@/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockEvent: Event = {
  id: '1',
  title: 'Test Event',
  description: 'This is a test event',
  date: '2026-02-15T00:00:00.000Z',
  time: '14:00',
  location: 'Paris, France',
  category: 'Formation',
  capacity: 30,
  reservedSpots: 10,
  status: EventStatus.PUBLISHED,
  organizer: 'user123',
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

describe('Reservation Flow Test', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders reservation modal with event details', () => {
    render(
      <ReservationModal
        isOpen={true}
        onClose={mockOnClose}
        event={mockEvent}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByRole('heading', { name: /confirmer la réservation/i })).toBeInTheDocument();
    expect(screen.getByText(/test event/i)).toBeInTheDocument();
    expect(screen.getByText(/paris, france/i)).toBeInTheDocument();
    expect(screen.getByText(/places disponibles/)).toBeInTheDocument();
  });

  it('allows user to add notes to reservation', async () => {
    const user = userEvent.setup();
    
    render(
      <ReservationModal
        isOpen={true}
        onClose={mockOnClose}
        event={mockEvent}
        onSubmit={mockOnSubmit}
      />
    );

    const notesInput = screen.getByPlaceholderText(/ajoutez des informations/i);
    await user.type(notesInput, 'Special dietary requirements');

    expect(notesInput).toHaveValue('Special dietary requirements');
  });

  it('submits reservation with notes', async () => {
    const user = userEvent.setup();
    
    render(
      <ReservationModal
        isOpen={true}
        onClose={mockOnClose}
        event={mockEvent}
        onSubmit={mockOnSubmit}
      />
    );

    const notesInput = screen.getByPlaceholderText(/ajoutez des informations/i);
    await user.type(notesInput, 'Test notes');

    const submitButton = screen.getByRole('button', { name: /confirmer la réservation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test notes');
    });
  });

  it('submits reservation without notes', async () => {
    const user = userEvent.setup();
    
    render(
      <ReservationModal
        isOpen={true}
        onClose={mockOnClose}
        event={mockEvent}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /confirmer la réservation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('');
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ReservationModal
        isOpen={true}
        onClose={mockOnClose}
        event={mockEvent}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables submit button when event is full', () => {
    const fullEvent = { ...mockEvent, reservedSpots: 30 };
    
    render(
      <ReservationModal
        isOpen={true}
        onClose={mockOnClose}
        event={fullEvent}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /complet/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state when submitting', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    const user = userEvent.setup();
    
    render(
      <ReservationModal
        isOpen={true}
        onClose={mockOnClose}
        event={mockEvent}
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /confirmer la réservation/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays warning message about validation', () => {
    render(
      <ReservationModal
        isOpen={true}
        onClose={mockOnClose}
        event={mockEvent}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/votre réservation sera soumise pour validation/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ReservationModal
        isOpen={false}
        onClose={mockOnClose}
        event={mockEvent}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByText(/confirmer la réservation/i)).not.toBeInTheDocument();
  });
});
