# 🎉 Eventify - Event Management & Reservation System

A robust backend API built with **NestJS** and **MongoDB** for managing events and reservations.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)

## ✨ Features

- **User Authentication** - JWT-based authentication with role-based access control
- **User Roles** - Admin and Participant roles with different permissions
- **Secure Passwords** - Bcrypt hashing for password security
- **Input Validation** - DTO validation using class-validator
- **MongoDB Integration** - Mongoose ODM for database operations
- **Docker Support** - Containerized deployment with Docker Compose

## 🛠 Tech Stack

| Technology | Description |
|------------|-------------|
| **NestJS** | Progressive Node.js framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **Passport** | Authentication middleware |
| **JWT** | JSON Web Tokens for auth |
| **Bcrypt** | Password hashing |
| **Docker** | Containerization |

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   └── modules/
│       ├── auth/                  # Authentication module
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   └── register.dto.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── roles.guard.ts
│       │   ├── decorators/
│       │   │   ├── roles.decorator.ts
│       │   │   └── current-user.decorator.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       └── users/                 # Users module
│           ├── users.module.ts
│           ├── users.service.ts
│           ├── dto/
│           │   └── create-user.dto.ts
│           └── schemas/
│               └── user.schema.ts
├── .env                           # Environment variables
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ 
- MongoDB (local or Docker)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd R_EVENT
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/eventify
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start MongoDB** (if not using Docker)
   ```bash
   # Using Docker
   docker run -d --name eventify-mongo -p 27017:27017 mongo:7
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the API**
   ```
   http://localhost:3000/api
   ```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login user | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |

### Request/Response Examples

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "participant",
    "createdAt": "2026-02-02T15:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "participant"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile (Protected)
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### How it works:

1. User registers or logs in
2. Server returns a JWT token
3. Include token in subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

### User Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to all resources |
| `participant` | Limited access, can manage own reservations |

### Using Guards

```typescript
// Protect a route with JWT
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

// Protect a route with specific roles
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Delete(':id')
deleteUser(@Param('id') id: string) {
  // Only admins can access
}
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services (MongoDB + Backend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `eventify-backend` | 3000 | NestJS API |
| `eventify-mongodb` | 27017 | MongoDB Database |

### Docker Commands

```bash
# Build and start
docker-compose up -d --build

# Check running containers
docker ps

# View backend logs
docker logs eventify-backend -f

# Access MongoDB shell
docker exec -it eventify-mongodb mongosh
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/eventify` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |

## 📜 Available Scripts

```bash
# Development
npm run start:dev      # Start with hot-reload

# Production
npm run build          # Build the project
npm run start:prod     # Start production server

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ using NestJS
