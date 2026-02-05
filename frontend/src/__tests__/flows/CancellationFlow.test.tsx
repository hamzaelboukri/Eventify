/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useReservationsStore } from '@/store/reservationsStore';
import { Reservation, ReservationStatus, EventStatus } from '@/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the reservations store
jest.mock('@/store/reservationsStore');
const mockUseReservationsStore = useReservationsStore as jest.MockedFunction<typeof useReservationsStore>;

const mockReservation: Reservation = {
  id: '1',
  userId: 'user1',
  eventId: 'event1',
  event: {
    id: 'event1',
    title: 'Concert Rock',
    description: 'Un concert incroyable',
    date: '2026-02-15T00:00:00.000Z',
    time: '20:00',
    location: 'Paris',
    category: 'Concert',
    capacity: 100,
    reservedSpots: 50,
    status: EventStatus.PUBLISHED,
    organizer: 'admin1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  status: ReservationStatus.CONFIRMED,
  notes: 'Test notes',
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

// Test component that simulates cancellation flow
const CancellationTestComponent = ({ reservation }: { reservation: Reservation }) => {
  const { cancelReservation, isLoading, error } = useReservationsStore();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [cancelled, setCancelled] = React.useState(false);

  const handleCancel = async () => {
    try {
      await cancelReservation(reservation.id);
      setCancelled(true);
      setShowConfirm(false);
    } catch (err) {
      // Error handled by store
    }
  };

  if (cancelled) {
    return <div>Réservation annulée avec succès</div>;
  }

  return (
    <div>
      <h2>{reservation.event?.title}</h2>
      <span>Status: {reservation.status}</span>
      
      {error && <div role="alert">{error}</div>}
      
      {!showConfirm ? (
        <button onClick={() => setShowConfirm(true)}>
          Annuler la réservation
        </button>
      ) : (
        <div>
          <p>Êtes-vous sûr de vouloir annuler cette réservation ?</p>
          <button onClick={handleCancel} disabled={isLoading}>
            {isLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
          </button>
          <button onClick={() => setShowConfirm(false)}>
            Retour
          </button>
        </div>
      )}
    </div>
  );
};

describe('Cancellation Flow Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reservation details with cancel button', () => {
    mockUseReservationsStore.mockReturnValue({
      reservations: [mockReservation],
      userReservations: [mockReservation],
      selectedReservation: null,
      isLoading: false,
      error: null,
      pagination: null,
      fetchReservations: jest.fn(),
      fetchUserReservations: jest.fn(),
      createReservation: jest.fn(),
      updateReservationStatus: jest.fn(),
      cancelReservation: jest.fn(),
      setSelectedReservation: jest.fn(),
      clearError: jest.fn(),
    });

    render(<CancellationTestComponent reservation={mockReservation} />);

    expect(screen.getByText(/concert rock/i)).toBeInTheDocument();
    expect(screen.getByText(/status: confirmed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler la réservation/i })).toBeInTheDocument();
  });

  it('shows confirmation dialog when cancel button is clicked', async () => {
    mockUseReservationsStore.mockReturnValue({
      reservations: [mockReservation],
      userReservations: [mockReservation],
      selectedReservation: null,
      isLoading: false,
      error: null,
      pagination: null,
      fetchReservations: jest.fn(),
      fetchUserReservations: jest.fn(),
      createReservation: jest.fn(),
      updateReservationStatus: jest.fn(),
      cancelReservation: jest.fn(),
      setSelectedReservation: jest.fn(),
      clearError: jest.fn(),
    });

    const user = userEvent.setup();
    render(<CancellationTestComponent reservation={mockReservation} />);

    await user.click(screen.getByRole('button', { name: /annuler la réservation/i }));

    expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmer l'annulation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
  });

  it('calls cancelReservation when confirmed', async () => {
    const mockCancelReservation = jest.fn().mockResolvedValue(undefined);
    mockUseReservationsStore.mockReturnValue({
      reservations: [mockReservation],
      userReservations: [mockReservation],
      selectedReservation: null,
      isLoading: false,
      error: null,
      pagination: null,
      fetchReservations: jest.fn(),
      fetchUserReservations: jest.fn(),
      createReservation: jest.fn(),
      updateReservationStatus: jest.fn(),
      cancelReservation: mockCancelReservation,
      setSelectedReservation: jest.fn(),
      clearError: jest.fn(),
    });

    const user = userEvent.setup();
    render(<CancellationTestComponent reservation={mockReservation} />);

    await user.click(screen.getByRole('button', { name: /annuler la réservation/i }));
    await user.click(screen.getByRole('button', { name: /confirmer l'annulation/i }));

    await waitFor(() => {
      expect(mockCancelReservation).toHaveBeenCalledWith('1');
    });
  });

  it('shows success message after cancellation', async () => {
    const mockCancelReservation = jest.fn().mockResolvedValue(undefined);
    mockUseReservationsStore.mockReturnValue({
      reservations: [mockReservation],
      userReservations: [mockReservation],
      selectedReservation: null,
      isLoading: false,
      error: null,
      pagination: null,
      fetchReservations: jest.fn(),
      fetchUserReservations: jest.fn(),
      createReservation: jest.fn(),
      updateReservationStatus: jest.fn(),
      cancelReservation: mockCancelReservation,
      setSelectedReservation: jest.fn(),
      clearError: jest.fn(),
    });

    const user = userEvent.setup();
    render(<CancellationTestComponent reservation={mockReservation} />);

    await user.click(screen.getByRole('button', { name: /annuler la réservation/i }));
    await user.click(screen.getByRole('button', { name: /confirmer l'annulation/i }));

    await waitFor(() => {
      expect(screen.getByText(/réservation annulée avec succès/i)).toBeInTheDocument();
    });
  });

  it('goes back to initial state when clicking retour', async () => {
    mockUseReservationsStore.mockReturnValue({
      reservations: [mockReservation],
      userReservations: [mockReservation],
      selectedReservation: null,
      isLoading: false,
      error: null,
      pagination: null,
      fetchReservations: jest.fn(),
      fetchUserReservations: jest.fn(),
      createReservation: jest.fn(),
      updateReservationStatus: jest.fn(),
      cancelReservation: jest.fn(),
      setSelectedReservation: jest.fn(),
      clearError: jest.fn(),
    });

    const user = userEvent.setup();
    render(<CancellationTestComponent reservation={mockReservation} />);

    await user.click(screen.getByRole('button', { name: /annuler la réservation/i }));
    expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /retour/i }));
    expect(screen.queryByText(/êtes-vous sûr/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler la réservation/i })).toBeInTheDocument();
  });

  it('shows loading state during cancellation', async () => {
    mockUseReservationsStore.mockReturnValue({
      reservations: [mockReservation],
      userReservations: [mockReservation],
      selectedReservation: null,
      isLoading: true,
      error: null,
      pagination: null,
      fetchReservations: jest.fn(),
      fetchUserReservations: jest.fn(),
      createReservation: jest.fn(),
      updateReservationStatus: jest.fn(),
      cancelReservation: jest.fn(),
      setSelectedReservation: jest.fn(),
      clearError: jest.fn(),
    });

    const user = userEvent.setup();
    render(<CancellationTestComponent reservation={mockReservation} />);

    await user.click(screen.getByRole('button', { name: /annuler la réservation/i }));

    const confirmButton = screen.getByRole('button', { name: /annulation/i });
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveTextContent(/annulation.../i);
  });

  it('displays error message on failed cancellation', () => {
    mockUseReservationsStore.mockReturnValue({
      reservations: [mockReservation],
      userReservations: [mockReservation],
      selectedReservation: null,
      isLoading: false,
      error: 'Erreur lors de l\'annulation',
      pagination: null,
      fetchReservations: jest.fn(),
      fetchUserReservations: jest.fn(),
      createReservation: jest.fn(),
      updateReservationStatus: jest.fn(),
      cancelReservation: jest.fn(),
      setSelectedReservation: jest.fn(),
      clearError: jest.fn(),
    });

    render(<CancellationTestComponent reservation={mockReservation} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/erreur lors de l'annulation/i);
  });
});
