# 🎉 Eventify - Event Management & Reservation System

A full-stack web application for managing events and reservations with role-based access control.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Business Rules](#business-rules)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)

## 🎯 Overview

Eventify is a comprehensive event management platform that allows organizations to create, manage, and track events while enabling participants to discover and book reservations seamlessly.

## ✨ Features

### Admin Features
- Create, modify, publish, and cancel events
- Define event details: title, description, date, location, capacity
- View all reservations (by event or participant)
- Confirm or refuse reservations
- Cancel reservations (even confirmed ones)
- Access dashboard with statistics:
  - Upcoming events
  - Fill rate
  - Reservation status distribution

### Participant Features
- Browse published events catalog
- View event details
- Make reservations (with business rule validation)
- View personal reservations
- Cancel reservations
- Download PDF ticket (for confirmed reservations only)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                     (Next.js + TypeScript)                   │
├─────────────────────────────────────────────────────────────┤
│                         API Layer                            │
│                    (NestJS REST API)                         │
├─────────────────────────────────────────────────────────────┤
│                       Database                               │
│                       (MongoDB)                              │
└─────────────────────────────────────────────────────────────┘
```

### Class Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    User      │       │    Event     │       │   Reservation    │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ _id          │       │ _id          │       │ _id              │
│ firstName    │       │ title        │       │ event (ref)      │
│ lastName     │       │ description  │       │ participant (ref)│
│ email        │       │ date         │       │ status           │
│ password     │       │ location     │       │ ticketNumber     │
│ role         │◄──────│ capacity     │◄──────│ notes            │
│ phone        │       │ reservedCount│       │ confirmedAt      │
│ isActive     │       │ status       │       │ canceledAt       │
│ createdAt    │       │ createdBy    │       │ createdAt        │
│ updatedAt    │       │ imageUrl     │       │ updatedAt        │
└──────────────┘       │ category     │       └──────────────────┘
                       │ createdAt    │
                       │ updatedAt    │
                       └──────────────┘

Enums:
- Role: ADMIN, PARTICIPANT
- EventStatus: DRAFT, PUBLISHED, CANCELED
- ReservationStatus: PENDING, CONFIRMED, REFUSED, CANCELED
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Passport
- **Validation**: class-validator & class-transformer
- **PDF Generation**: PDFKit
- **Testing**: Jest

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB 7.x
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/eventify.git
cd eventify
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB** (if not using Docker)
```bash
# Make sure MongoDB is running on localhost:27017
```

5. **Run database seed** (optional)
```bash
npm run seed
```

6. **Start the development server**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

### Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eventify.com | Admin@123 |
| Participant | participant@eventify.com | User@123 |

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new participant | No |
| POST | `/api/auth/login` | Login and get JWT token | No |

### Users Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get current user profile | JWT |
| PATCH | `/api/users/profile/update` | Update own profile | JWT |
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| POST | `/api/users` | Create user | Admin |
| PATCH | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Events Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events/public` | List published events | No |
| GET | `/api/events/public/:id` | Get published event details | No |
| GET | `/api/events` | List all events | Admin |
| GET | `/api/events/:id` | Get event by ID | Admin |
| POST | `/api/events` | Create event | Admin |
| PATCH | `/api/events/:id` | Update event | Admin |
| PATCH | `/api/events/:id/publish` | Publish event | Admin |
| PATCH | `/api/events/:id/cancel` | Cancel event | Admin |
| DELETE | `/api/events/:id` | Delete event | Admin |
| GET | `/api/events/statistics` | Get event statistics | Admin |

### Reservations Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/reservations` | Create reservation | JWT |
| GET | `/api/reservations/my-reservations` | Get own reservations | JWT |
| GET | `/api/reservations/:id` | Get reservation details | JWT |
| PATCH | `/api/reservations/:id/cancel` | Cancel reservation | JWT |
| GET | `/api/reservations/:id/ticket` | Download ticket PDF | JWT |
| GET | `/api/reservations` | List all reservations | Admin |
| GET | `/api/reservations/event/:eventId` | Reservations by event | Admin |
| GET | `/api/reservations/participant/:id` | Reservations by user | Admin |
| PATCH | `/api/reservations/:id/confirm` | Confirm reservation | Admin |
| PATCH | `/api/reservations/:id/refuse` | Refuse reservation | Admin |
| GET | `/api/reservations/statistics` | Reservation statistics | Admin |

## 📏 Business Rules

### Events
1. An event has status: `DRAFT`, `PUBLISHED`, or `CANCELED`
2. Only `PUBLISHED` events are visible to participants
3. A canceled event cannot be published again

### Reservations
1. A reservation has status: `PENDING`, `CONFIRMED`, `REFUSED`, or `CANCELED`
2. A participant **cannot** reserve:
   - A non-published event
   - A canceled event
   - A full event (capacity reached)
   - An event they already have an active reservation for
3. Maximum capacity must never be exceeded
4. PDF ticket download is only available for `CONFIRMED` reservations
5. Participants can only cancel their own reservations
6. Admin can cancel any reservation

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run E2E Tests
```bash
npm run test:e2e
```

## 🐳 Docker Deployment

### Using Docker Compose

1. **Create environment file**
```bash
cp .env.docker.example .env
# Edit with your production values
```

2. **Build and start services**
```bash
docker-compose up -d
```

3. **Check services status**
```bash
docker-compose ps
```

4. **View logs**
```bash
docker-compose logs -f backend
```

5. **Stop services**
```bash
docker-compose down
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| backend | 3000 | NestJS API |
| mongodb | 27017 | MongoDB Database |

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment.

### Pipeline Jobs

1. **Backend**
   - Install dependencies (with caching)
   - Run linting
   - Run unit tests
   - Run E2E tests
   - Build application

2. **Docker** (on main/master push)
   - Build Docker image

### Pipeline Triggers
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

### Pipeline Requirements
- All linting must pass
- All tests must pass
- Build must succeed

## 📁 Project Structure

```
backend/
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── enums/
│   │   │   ├── event-status.enum.ts
│   │   │   ├── reservation-status.enum.ts
│   │   │   └── role.enum.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── guards/
│   │       └── roles.guard.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   ├── events/
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   ├── events.controller.ts
│   │   │   ├── events.module.ts
│   │   │   └── events.service.ts
│   │   ├── reservations/
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   ├── pdf.service.ts
│   │   │   ├── reservations.controller.ts
│   │   │   ├── reservations.module.ts
│   │   │   └── reservations.service.ts
│   │   └── users/
│   │       ├── dto/
│   │       ├── schemas/
│   │       ├── users.controller.ts
│   │       ├── users.module.ts
│   │       └── users.service.ts
│   ├── scripts/
│   │   └── seed.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env.example
├── Dockerfile
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Eventify Team - 2026