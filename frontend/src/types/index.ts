// User Types
export enum UserRole {
  ADMIN = 'admin',
  PARTICIPANT = 'participant',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Event Types
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELED = 'canceled',
}

export interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  category: string;
  capacity: number;
  reservedSpots: number;
  availableSpots?: number;
  status: EventStatus;
  organizer: string | User;
  price?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  category?: string;
  capacity: number;
  price?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: EventStatus;
}

// Reservation Types
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REFUSED = 'refused',
  CANCELED = 'canceled',
}

export interface Reservation {
  id: string;
  _id?: string;
  event: Event | string;
  participant: User | string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationDto {
  eventId: string;
  notes?: string;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Stats Types
export interface EventStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  canceledEvents: number;
  upcomingEvents: number;
  totalCapacity: number;
  totalReservedSpots: number;
  averageFillRate: number;
}

export interface ReservationStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  refusedReservations: number;
  canceledReservations: number;
}

// API Error Response
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
