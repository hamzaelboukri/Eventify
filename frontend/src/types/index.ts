// User Roles
export enum UserRole {
  ADMIN = "admin",
  PARTICIPANT = "participant",
}

// Event Status
export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CANCELED = "canceled",
}

// Reservation Status
export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  REFUSED = "refused",
  CANCELED = "canceled",
}

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Event Interface
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  image?: string;
  price?: string;
  category: string;
  capacity?: number;
  availableSpots?: number;
  status?: EventStatus;
  organizer?: string;
  attendees?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Reservation Interface
export interface Reservation {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  user?: User;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

// Category Interface
export interface Category {
  name: string;
  slug: string;
  icon: string;
  count?: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalEvents: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  totalParticipants: number;
  upcomingEvents: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Component Props
export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
  name?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
