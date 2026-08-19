# CareerFlow

**CareerFlow** is a full-stack job & internship application tracker that helps students, fresh graduates, and job seekers manage their entire job search — applications, interviews, statuses, and resumes — in one clean, organized place.

---
# Live Demo
Frontend URL: https://career-flow-17pz.vercel.app

Backend URL: https://career-flow-puce.vercel.app/api/health

## Table of contents

- [Project overview](#project-overview)
- [The problem](#the-problem)
- [The solution](#the-solution)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Authentication flow](#authentication-flow)
- [Authorization](#authorization)
- [Database design](#database-design)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [Testing](#testing)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future improvements](#future-improvements)

---

## Project overview

CareerFlow is a two-sided web application (React frontend + Express/MongoDB backend) that lets a user register, log job applications as they apply, attach interviews to each application, track status through the hiring pipeline (Applied → Interview → Offer / Rejected / Withdrawn), and view their progress on a visual dashboard. A separate admin role can view system-wide statistics and manage registered users.

## The problem

Job seekers — especially students juggling dozens of internship and full-time applications — typically fall back on scattered spreadsheets, notes apps, or email threads to track where they've applied, what stage each application is at, and when their next interview is. This is error-prone, hard to search, and gives no visibility into overall progress.

## The solution

CareerFlow centralizes the entire process:

- One place to log every application with company, role, status, salary, and notes.
- Interviews are linked directly to the application they belong to, so context is never lost.
- A dashboard turns raw data into an at-a-glance view of pipeline health (applied vs. interviewing vs. offers).
- Search and filters make it fast to find a specific application among dozens.
- A resume can be attached to the profile so it's always one click away when needed.

## Features

**User-facing**
- Register / log in / log out with JWT-based authentication
- Personal dashboard with summary stats and charts (status breakdown + applications over time)
- Full CRUD on job applications (create, view, edit, delete)
- Full CRUD on interviews, linked to a specific application
- Search applications by company/position; filter by status and job type; paginated results
- Resume upload (PDF/DOC/DOCX) stored via Cloudinary
- Profile management: update name, change password
- Responsive UI across desktop, tablet, and mobile

**Admin-facing**
- Admin dashboard with system-wide totals (users, applications, interviews) and status breakdown
- Recent activity feed across all users
- User management (view all users, remove non-admin accounts)

**Engineering**
- Client-side and server-side validation (Zod) on every form/endpoint
- Ownership checks so users can only modify their own data; admin bypass where appropriate
- Centralized error handling with consistent JSON responses and correct HTTP status codes
- Rate limiting on auth endpoints, Helmet security headers, CORS configuration
- Loading, error, and empty states throughout the UI
- Automated tests: Jest/Supertest (backend), Vitest/RTL (frontend)

## Technology stack

**Frontend:** React 18, Vite, React Router, Axios, Recharts, plain CSS with a custom design system (no Tailwind, no UI kit — hand-built components).

**Backend:** Node.js, Express, Mongoose (MongoDB), JWT (`jsonwebtoken`), `bcryptjs` for password hashing, Zod for validation, Multer + Cloudinary for resume uploads, Helmet, CORS, `express-rate-limit`.

**Database:** MongoDB (works with MongoDB Atlas or a local instance).

**Testing:** Jest + Supertest + `mongodb-memory-server` (backend), Vitest + React Testing Library (frontend).

## Architecture

```
React (Vite)
   ↓  Axios (JWT in Authorization header)
Express REST API
   ↓  Mongoose ODM
MongoDB
```

The frontend is a single-page application that talks to the backend exclusively through a versioned REST API under `/api`. The backend is organized in layers:

```
backend/src/
├── config/        # DB + Cloudinary configuration
├── models/        # Mongoose schemas (User, JobApplication, Interview)
├── controllers/    # Route handlers / business logic
├── routes/        # Express routers, wire middleware + controllers
├── middleware/    # auth, validation, error handling, file upload
├── validators/    # Zod schemas
└── utils/         # helpers (JWT, async wrapper, custom error class, seed script)
```

## Authentication flow

1. On register/login, the backend hashes/verifies the password with `bcryptjs` and issues a JWT (`jsonwebtoken`) containing the user's id and role.
2. The token is returned in the JSON response **and** set as an `httpOnly` cookie. The frontend stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every request via an Axios interceptor.
3. Protected backend routes run an `authenticate` middleware that verifies the JWT, loads the user from MongoDB, and attaches it to `req.user`.
4. The frontend keeps an `AuthContext` in sync: on load it calls `GET /api/auth/me` if a token exists, and `ProtectedRoute` components redirect unauthenticated users to `/login`.

## Authorization

- Every user has a `role` of `USER` or `ADMIN`.
- Ownership checks are enforced **on the backend** for every application/interview mutation — a user can only read/update/delete resources where `resource.userId === req.user._id`, regardless of what the frontend sends.
- Admin-only routes (`/api/admin/*`) use an `authorize('ADMIN')` middleware; the frontend also hides admin navigation/routes from non-admins via `ProtectedRoute adminOnly`, but this is a UX convenience only — the real enforcement is server-side.

## Database design

**User**
`name, email (unique), password (hashed), role, resumeUrl, resumeName, timestamps`

**JobApplication**
`userId (ref User), company, position, location, jobType, status, applicationDate, salary, jobUrl, description, notes, timestamps`

**Interview**
`applicationId (ref JobApplication), userId (ref User), interviewDate, interviewType, interviewer, locationOrLink, status, notes, timestamps`

Relationships: one `User` has many `JobApplication`s; one `JobApplication` has many `Interview`s. Indexes are added on `userId + status`, `userId + applicationDate`, and a text index on `company`/`position` to support search.

## Installation

Prerequisites: Node.js 18+, npm, and either a MongoDB Atlas connection string or a local MongoDB instance.

```bash
# 1. Clone / unzip the project, then from the project root:

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

## Environment variables

Copy the example files and fill in real values.

**backend/.env** (copy from `backend/.env.example`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/careerflow
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**frontend/.env** (copy from `frontend/.env.example`)
```env
VITE_API_URL=http://localhost:5000/api
```

> Resume upload requires a free [Cloudinary](https://cloudinary.com) account. Everything else works without it.

## Running locally

In two terminals:

```bash
# Terminal 1 — backend
cd backend
npm run dev        # starts the API on http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev         # starts the app on http://localhost:5173
```

Optional: seed the database with a demo admin and user account plus sample applications:

```bash
cd backend
npm run seed
```

This creates:
- Admin: `admin@careerflow.dev` / `Admin1234`
- User: `jordan@careerflow.dev` / `Password1`

## Testing

**Backend** (Jest + Supertest, using an in-memory MongoDB instance — no real database needed):
```bash
cd backend
npm test
npm run test:coverage
```

**Frontend** (Vitest + React Testing Library):
```bash
cd frontend
npm test
npm run test:coverage
```

## Deployment

**Backend** — deployable to any Node host (Render, Railway, Fly.io, etc.):
- Set the environment variables listed above (with production values) in your host's dashboard.
- Set `CLIENT_URL` to your deployed frontend URL so CORS allows it.
- Build command: `npm install`. Start command: `npm start`.

**Frontend** — deployable to any static host (Vercel, Netlify, etc.):
- Set `VITE_API_URL` to your deployed backend's `/api` URL.
- Build command: `npm run build`. Output directory: `dist`.

**Database** — use a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster; whitelist your backend host's IP (or `0.0.0.0/0` for simplicity) and use the provided connection string as `MONGODB_URI`.

Double-check before going live: no `localhost` URLs remain in either `.env`, CORS is scoped to your real frontend domain, and Cloudinary credentials are set if resume upload is needed in production.

## Screenshots

_Add screenshots here after running the app locally:_
- Landing page
- Dashboard with charts
- Applications list (with filters)
- Application details page
- Admin dashboard

## Future improvements

- Email notifications/reminders for upcoming interviews
- Kanban-style drag-and-drop board view for applications by status
- Browser extension to auto-fill applications from job postings
- Export applications to CSV/PDF
- Multi-resume support with per-application resume selection
- OAuth login (Google/GitHub)
