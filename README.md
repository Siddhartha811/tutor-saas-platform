# Atelier — Tutor SaaS Platform

A minimalist, multi-tenant workspace for independent educators to manage students, track session attendance, and manage payments.

**Live Demo:** https://tutor-saas-platform-ure1bjqbg-siddhartha-projects.vercel.app  
**API Health:** https://tutor-saas-platform.onrender.com/api/health

---

## Features

- Multi-tenant architecture — each tutor gets an isolated workspace with tenant-scoped data
- JWT authentication with role-based access control
- Student roster management with CRUD operations
- Soft delete for students to preserve historical records
- Session scheduling
- Weekly recurring session batches
- Roll-call attendance tracking per session
- Invoice creation and payment management
- Responsive dashboard with an editorial-minimalist design
- Production deployment with Vercel, Render, and MongoDB Atlas

---

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod

### Frontend

- React
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Lucide React

### Infrastructure

- MongoDB Atlas
- Render
- Vercel

---

## Architecture

Atelier follows a multi-tenant architecture where each tutor operates inside an isolated workspace.

Every tenant-owned document, including:

- `Student`
- `Session`
- `Payment`

contains a `tenantId`.

Authenticated requests are handled through JWT authentication. The `tenantScope` middleware reads the authenticated user's `tenantId` and ensures database queries are scoped to that tenant.

The application does not trust tenant IDs supplied by the client.

This prevents users from accessing data belonging to another workspace.

---

## Application Flow

```text
User
 │
 ▼
React + Vite Frontend
 │
 │ HTTP / JSON
 ▼
Express.js API
 │
 ├── JWT Authentication
 ├── Tenant Scope Middleware
 ├── Request Validation
 │
 ▼
MongoDB Atlas
```

The frontend communicates with the production backend through the `VITE_API_URL` environment variable.

---

## API Overview

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Students | `GET/POST /api/students`, `PATCH/DELETE /api/students/:id` |
| Sessions | `GET/POST /api/sessions`, `POST /api/sessions/recurring`, `POST /api/sessions/:id/attendance` |
| Payments | `GET/POST /api/payments` |

Full request/response examples are available in:

```text
backend/postman_collection.json
```

---

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Configure the required environment variables in `.env`, including:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
CLIENT_URL=http://localhost:5173
```

---

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set:

```env
VITE_API_URL=http://localhost:5001/api
```

---

## Production Deployment

### Frontend

The frontend is deployed on Vercel.

```text
https://tutor-saas-platform-ure1bjqbg-siddhartha-projects.vercel.app
```

### Backend

The backend is deployed on Render.

```text
https://tutor-saas-platform.onrender.com
```

### Database

MongoDB Atlas is used as the production database.

---

## Payment Integration

The current application supports invoice creation and payment management.

A production-ready India-compatible payment gateway integration is planned for a future version.

---

## Roadmap

- India-compatible payment gateway integration
- Email reminders for upcoming sessions
- Automated reminders for unpaid invoices
- Multi-tutor workspaces
- Exportable attendance reports
- Exportable payment reports
- CSV/PDF reporting
- Improved analytics and dashboard insights

---

## Project Structure

```text
tutor-saas-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── validators/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── lib/
│   └── vite.config.js
│
└── README.md
```

---

## Future Improvements

The platform is designed to be extended with additional communication, payment, reporting, and collaboration features while maintaining tenant isolation and a simple user experience.