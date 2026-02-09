/* eslint-disable react/display-name */
// eslint-disable-next-line react/display-name
import React from 'react';
import { render, screen } from '@testing-library/react';
import EventCard from '@/components/events/EventCard';
import { Event, EventStatus } from '@/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockEvent: Event = {
  id: '1',
  title: 'Test Event',
  description: 'This is a test event description',
  date: '2026-02-15T00:00:00.000Z',
  time: '14:00',
  location: 'Paris, France',
  category: 'Formation',
  capacity: 30,
  reservedSpots: 15,
  status: EventStatus.PUBLISHED,
  organizer: 'user123',
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

describe('EventCard Component', () => {
  it('renders event title', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/test event/i)).toBeInTheDocument();
  });

  it('renders event date', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/15 février 2026/i)).toBeInTheDocument();
  });

  it('renders event time', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/14:00/i)).toBeInTheDocument();
  });

  it('renders event location', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/paris, france/i)).toBeInTheDocument();
  });

  it('renders event category', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/formation/i)).toBeInTheDocument();
  });

  it('displays available spots correctly', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/15 places disponibles/i)).toBeInTheDocument();
  });

  it('displays fill rate percentage', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/50%/i)).toBeInTheDocument();
  });

  it('shows status badge when showStatus is true', () => {
    render(<EventCard event={mockEvent} showStatus />);
    expect(screen.getByText(/publié/i)).toBeInTheDocument();
  });

  it('does not show status badge by default', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.queryByText(/publié/i)).not.toBeInTheDocument();
  });

  it('links to correct event detail page', () => {
    render(<EventCard event={mockEvent} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/events/1');
  });

  it('links to admin page when isAdmin is true', () => {
    render(<EventCard event={mockEvent} isAdmin />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard/admin/events/1');
  });

  it('displays "Complet" when no spots available', () => {
    const fullEvent = { ...mockEvent, reservedSpots: 30 };
    render(<EventCard event={fullEvent} />);
    expect(screen.getByText(/complet/i)).toBeInTheDocument();
  });

  it('displays price when provided', () => {
    const eventWithPrice = { ...mockEvent, price: '50' };
    render(<EventCard event={eventWithPrice} />);
    expect(screen.getByText(/50 €/i)).toBeInTheDocument();
  });

  it('displays "Gratuit" for free events', () => {
    const freeEvent = { ...mockEvent, price: 'Gratuit' };
    render(<EventCard event={freeEvent} />);
    expect(screen.getByText(/gratuit/i)).toBeInTheDocument();
  });
});
