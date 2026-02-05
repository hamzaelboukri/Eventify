// API Base URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// App Name
export const APP_NAME = 'Eventify';

// Navigation Links
export const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/events', label: 'Événements' },
];

export const ADMIN_NAV_LINKS = [
  { href: '/dashboard/admin', label: 'Tableau de bord' },
  { href: '/dashboard/admin/events', label: 'Événements' },
  { href: '/dashboard/admin/reservations', label: 'Réservations' },
];

export const PARTICIPANT_NAV_LINKS = [
  { href: '/dashboard/participant', label: 'Tableau de bord' },
  { href: '/dashboard/participant/reservations', label: 'Mes Réservations' },
];

// Event Status Config
export const EVENT_STATUS_CONFIG = {
  draft: {
    label: 'Brouillon',
    color: 'bg-gray-500',
    textColor: 'text-gray-500',
  },
  published: {
    label: 'Publié',
    color: 'bg-green-500',
    textColor: 'text-green-500',
  },
  canceled: {
    label: 'Annulé',
    color: 'bg-red-500',
    textColor: 'text-red-500',
  },
};

// Reservation Status Config
export const RESERVATION_STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
  },
  confirmed: {
    label: 'Confirmée',
    color: 'bg-green-500',
    textColor: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  refused: {
    label: 'Refusée',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    bgColor: 'bg-red-100',
  },
  canceled: {
    label: 'Annulée',
    color: 'bg-gray-500',
    textColor: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
};

// Event Categories
export const EVENT_CATEGORIES = [
  'Formation',
  'Atelier',
  'Conférence',
  'Networking',
  'Workshop',
  'Hackathon',
  'Meetup',
  'Webinaire',
  'Autre',
];
