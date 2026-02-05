// App Configuration
export const APP_NAME = "Eventify";
export const APP_DESCRIPTION = "Plateforme de gestion et réservation d'événements";

export const APP_CONFIG = {
  APP_NAME: "Eventify",
  APP_DESCRIPTION: "Plateforme de gestion et réservation d'événements",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
};

// Categories
export const CATEGORIES = [
  { name: "Conférence", slug: "conference", icon: "🎤" },
  { name: "Atelier", slug: "atelier", icon: "🛠️" },
  { name: "Formation", slug: "formation", icon: "📚" },
  { name: "Webinaire", slug: "webinaire", icon: "💻" },
  { name: "Networking", slug: "networking", icon: "🤝" },
  { name: "Autre", slug: "autre", icon: "📅" },
];

// Stats for Homepage
export const STATS = [
  { value: "500+", label: "Événements" },
  { value: "10K+", label: "Participants" },
  { value: "50+", label: "Organisateurs" },
  { value: "98%", label: "Satisfaction" },
];

// Footer Links
export const FOOTER_LINKS = {
  quickLinks: [
    { href: "/events", label: "Événements" },
    { href: "/login", label: "Connexion" },
    { href: "/register", label: "Inscription" },
  ],
  support: [
    { href: "/help", label: "Aide" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
};

// Social Links
export const SOCIAL_LINKS = [
  { name: "Twitter", icon: "twitter", href: "https://twitter.com" },
  { name: "Instagram", icon: "instagram", href: "https://instagram.com" },
  { name: "Facebook", icon: "facebook", href: "https://facebook.com" },
];

// Event Status Configuration
export const EVENT_STATUS_CONFIG = {
  draft: { label: "Brouillon", color: "bg-slate-500", textColor: "text-slate-300" },
  published: { label: "Publié", color: "bg-green-500", textColor: "text-green-300" },
  canceled: { label: "Annulé", color: "bg-red-500", textColor: "text-red-300" },
};

// Reservation Status Configuration
export const RESERVATION_STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-yellow-500", textColor: "text-yellow-300" },
  confirmed: { label: "Confirmée", color: "bg-green-500", textColor: "text-green-300" },
  refused: { label: "Refusée", color: "bg-red-500", textColor: "text-red-300" },
  canceled: { label: "Annulée", color: "bg-slate-500", textColor: "text-slate-300" },
};

// Navigation Links
export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/events", label: "Événements" },
];

// Admin Navigation
export const ADMIN_NAV_LINKS = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/admin/events", label: "Événements", icon: "📅" },
  { href: "/dashboard/admin/reservations", label: "Réservations", icon: "🎟️" },
];

// Participant Navigation
export const PARTICIPANT_NAV_LINKS = [
  { href: "/dashboard/participant", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/participant/reservations", label: "Mes Réservations", icon: "🎟️" },
];
