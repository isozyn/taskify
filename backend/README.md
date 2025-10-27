# Taskify Backend - Implementation Plan

## 📋 Overview
Complete backend setup for **Taskify** - A Project Management Tool using **Node.js**, **Express.js**, and **PostgreSQL** (via **Prisma ORM**).

This document outlines the architecture, setup instructions, and implementation guidelines following modern best practices with proper folder structure and clear separation of concerns.

---

## 🏗️ Architecture Pattern
**MVC + Service Layer Architecture**
- **Models** - Database schema and data structures (Prisma)
- **Services** - Business logic and database operations
- **Controllers** - Request/response handling
- **Routes** - API endpoint definitions
- **Middleware** - Authentication, validation, and error handling

---

## 🚀 Technology Stack

### Core Dependencies
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Prisma ORM** - Database toolkit with type safety
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Additional Packages
- **express-validator** - Input validation
- **helmet** - Security headers
- **compression** - Response compression
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **dotenv** - Environment variables
- **nodemon** - Development auto-reload

---

## 📁 Project Structure

```
backend/
 ├── src/
 │   ├── config/
 │   │   └── db.js                 # Prisma client initialization
 │   │
 │   ├── models/                   # (Optional) TypeScript interfaces
 │   │
 │   ├── services/
 │   │   ├── userService.js        # User business logic & DB operations
 │   │   ├── authService.js        # Authentication logic
 │   │   ├── projectService.js     # Project business logic
 │   │   ├── taskService.js        # Task business logic
 │   │   └── emailService.js       # Email operations (password reset, etc.)
 │   │
 │   ├── controllers/
 │   │   ├── authController.js     # Login, register, password reset
 │   │   ├── userController.js     # User CRUD operations
 │   │   ├── projectController.js  # Project CRUD operations
 │   │   └── taskController.js     # Task CRUD operations
 │   │
 │   ├── routes/
 │   │   ├── authRoutes.js         # /api/v1/auth/*
 │   │   ├── userRoutes.js         # /api/v1/users/*
 │   │   ├── projectRoutes.js      # /api/v1/projects/*
 │   │   └── taskRoutes.js         # /api/v1/tasks/*
 │   │
 │   ├── middleware/
 │   │   ├── authMiddleware.js     # JWT verification
 │   │   ├── validateRequest.js    # Input validation
 │   │   ├── errorHandler.js       # Centralized error handling
 │   │   └── rateLimiter.js        # Rate limiting
 │   │
 │   ├── utils/
 │   │   ├── tokenGenerator.js     # JWT and reset token generation
 │   │   ├── emailTemplates.js     # Email HTML templates
 │   │   └── logger.js             # Custom logging utility
 │   │
 │   └── server.js                 # Application entry point
 │
 ├── prisma/
 │   ├── schema.prisma             # Database schema
 │   ├── seed.js                   # Database seeding script
 │   └── migrations/               # Migration history
 │
 ├── tests/
 │   ├── unit/                     # Unit tests
 │   ├── integration/              # Integration tests
 │   └── setup.js                  # Test configuration
 │
 ├── .env                          # Environment variables (gitignored)
 ├── .env.example                  # Environment template
 ├── .gitignore
 ├── package.json
 ├── README.md
 └── docker-compose.yml            # (Optional) Docker setup
```

---

## 🗄️ Database Schema (Prisma)

### Schema File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                Int       @id @default(autoincrement())
  name              String
  email             String    @unique
  password          String
  avatar            String?
  role              Role      @default(USER)
  isEmailVerified   Boolean   @default(false)
  resetToken        String?
  resetTokenExpiry  DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  projects          Project[]
  tasks             Task[]    @relation("AssignedTasks")
  comments          Comment[]
}

enum Role {
  USER
  ADMIN
}

model Project {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  color       String?   @default("#D97706")
  status      ProjectStatus @default(ACTIVE)
  ownerId     Int
  owner       User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  members     ProjectMember[]
  tasks       Task[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([ownerId])
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  COMPLETED
}

model ProjectMember {
  id        Int       @id @default(autoincrement())
  projectId Int
  userId    Int
  role      MemberRole @default(MEMBER)
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  joinedAt  DateTime  @default(now())
  
  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime?
  projectId   Int
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assigneeId  Int?
  assignee    User?     @relation("AssignedTasks", fields: [assigneeId], references: [id], onDelete: SetNull)
  tags        String[]
  order       Int       @default(0)
  comments    Comment[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  COMPLETED
  BLOCKED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Comment {
  id        Int       @id @default(autoincrement())
  content   String
  taskId    Int
  task      Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([taskId])
  @@index([authorId])
}
```

---

## ⚙️ Setup Instructions

### 1. Initialize Project
```bash
cd backend
npm init -y
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install express @prisma/client dotenv bcrypt jsonwebtoken
npm install cors morgan helmet compression express-validator
npm install nodemon prisma --save-dev

# Optional: Testing
npm install jest supertest --save-dev

# Optional: Email service
npm install nodemailer
```

### 3. Initialize Prisma
```bash
npx prisma init
```

### 4. Configure Environment Variables
Create `.env` file:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskify?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN=7d

# Password Reset
RESET_TOKEN_EXPIRES_IN=3600000  # 1 hour in milliseconds

# Email Service (Optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@taskify.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

Create `.env.example` with same keys but placeholder values.

### 5. Run Database Migration
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Seed Database (Optional)
```bash
npx prisma db seed
```

---

## 🔐 Authentication Flow

### Registration
1. User submits registration form (name, email, password)
2. Validate input data
3. Check if email already exists
4. Hash password with bcrypt
5. Create user in database
6. Generate JWT token
7. Return user data and token

### Login
1. User submits credentials (email, password)
2. Validate input data
3. Find user by email
4. Compare password with bcrypt
5. Generate JWT token
6. Return user data and token

### Password Reset
1. **Forgot Password**: User submits email
   - Generate unique reset token
   - Set expiration time (1 hour)
   - Save token to database
   - Send email with reset link
   
2. **Reset Password**: User clicks link with token
   - Verify token exists and not expired
   - Show reset password form
   - User submits new password
   - Hash new password
   - Update user password
   - Clear reset token
   - Send confirmation email

---

## 📡 API Endpoints

### Authentication Routes (`/api/v1/auth`)
```
POST   /register           - Register new user
POST   /login              - Login user
POST   /logout             - Logout user
POST   /forgot-password    - Request password reset
POST   /reset-password     - Reset password with token
GET    /verify-token       - Verify reset token validity
GET    /me                 - Get current user (protected)
```

### User Routes (`/api/v1/users`)
```
GET    /                   - Get all users (admin)
GET    /:id                - Get user by ID
PUT    /:id                - Update user
DELETE /:id                - Delete user
PUT    /:id/avatar         - Update user avatar
```

### Project Routes (`/api/v1/projects`)
```
GET    /                   - Get all user projects
POST   /                   - Create new project
GET    /:id                - Get project by ID
PUT    /:id                - Update project
DELETE /:id                - Delete project
POST   /:id/members        - Add project member
DELETE /:id/members/:userId - Remove project member
GET    /:id/tasks          - Get all project tasks
```

### Task Routes (`/api/v1/tasks`)
```
GET    /                   - Get all tasks (with filters)
POST   /                   - Create new task
GET    /:id                - Get task by ID
PUT    /:id                - Update task
DELETE /:id                - Delete task
PUT    /:id/status         - Update task status
PUT    /:id/assign         - Assign task to user
POST   /:id/comments       - Add comment to task
GET    /:id/comments       - Get task comments
```

---

## 🛡️ Security Best Practices

### Implemented Security Measures
1. **Password Hashing** - bcrypt with salt rounds
2. **JWT Authentication** - Secure token-based auth
3. **HTTP Headers** - Helmet middleware
4. **CORS** - Configured cross-origin policies
5. **Rate Limiting** - Prevent brute force attacks
6. **Input Validation** - express-validator
7. **SQL Injection Protection** - Prisma ORM
8. **Environment Variables** - Sensitive data protection
9. **Error Handling** - No sensitive data exposure
10. **HTTPS Only** - In production

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Token generation/validation

### Integration Tests
- API endpoint responses
- Authentication flow
- CRUD operations
- Error handling

### Test Setup
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 📝 Code Examples

### Example Service (`src/services/userService.js`)
```javascript
import prisma from '../config/db.js';
import bcrypt from 'bcrypt';

export const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  return await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
};

export const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};
```

### Example Controller (`src/controllers/authController.js`)
```javascript
import * as authService from '../services/authService.js';
import { validationResult } from 'express-validator';

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await authService.registerUser(req.body);
    const token = authService.generateToken(user.id);

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};
```

### Example Middleware (`src/middleware/authMiddleware.js`)
```javascript
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};
```

---

## 🚀 Deployment

### Environment Setup
- **Development**: Local PostgreSQL
- **Staging**: Cloud PostgreSQL (Neon, Supabase)
- **Production**: Managed PostgreSQL with backups

### Deployment Platforms
- **Render** - Easy Node.js hosting
- **Railway** - Full-stack deployment
- **Vercel** - Serverless functions
- **Heroku** - Traditional hosting
- **DigitalOcean** - VPS option

### Pre-Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS origins set correctly
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] HTTPS enforced
- [ ] Database backups enabled
- [ ] Health check endpoint added

---

## 📦 NPM Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "migrate": "npx prisma migrate dev",
    "migrate:prod": "npx prisma migrate deploy",
    "seed": "node prisma/seed.js",
    "prisma:generate": "npx prisma generate",
    "prisma:studio": "npx prisma studio",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🔄 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/user-authentication
   ```

2. **Database Changes**
   ```bash
   # Modify prisma/schema.prisma
   npx prisma migrate dev --name add_user_fields
   ```

3. **Development**
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   ```

4. **Testing**
   ```bash
   npm test
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: implement user authentication"
   git push origin feature/user-authentication
   ```

---

## 📚 Additional Resources

### Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT.io](https://jwt.io/introduction)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Learning Path
1. Understand Express.js routing and middleware
2. Learn Prisma ORM fundamentals
3. Study JWT authentication flow
4. Practice REST API design principles
5. Implement error handling patterns

---

## 🎯 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup and dependencies
- [ ] Database schema design
- [ ] Prisma configuration
- [ ] Basic Express server
- [ ] Error handling middleware

### Phase 2: Authentication (Week 2)
- [ ] User registration
- [ ] User login
- [ ] JWT implementation
- [ ] Password reset flow
- [ ] Auth middleware

### Phase 3: Core Features (Week 3-4)
- [ ] Project CRUD operations
- [ ] Task CRUD operations
- [ ] User management
- [ ] Project members
- [ ] Task assignments

### Phase 4: Advanced Features (Week 5-6)
- [ ] Comments system
- [ ] File uploads
- [ ] Real-time updates (Socket.io)
- [ ] Email notifications
- [ ] Search and filters

### Phase 5: Testing & Deployment (Week 7)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Monitoring setup

---

## 🤝 Contributing Guidelines

1. Follow the established folder structure
2. Write descriptive commit messages
3. Add tests for new features
4. Update documentation
5. Use meaningful variable names
6. Handle errors properly
7. Validate all inputs

---

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check existing documentation
- Review Prisma and Express.js docs

---

**Last Updated**: October 23, 2025
**Version**: 1.0.0
**Status**: Planning Phase

---

> 🎯 **Goal**: Build a secure, scalable, and maintainable backend for Taskify following industry best practices and modern development standards.
