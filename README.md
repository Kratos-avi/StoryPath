# StoryPath Production Guide

This repository contains:

- `backend/` Express + Prisma API
- `frontend/` React + Vite client

## 1. Prerequisites

- Node.js 20+
- MySQL database

## 2. Backend Setup

1. Create `backend/.env` from `backend/.env.example`.

2. Set secure values in `.env`:

- `DATABASE_URL`
- `JWT_SECRET` (long random secret)
- `FRONTEND_ORIGIN` (comma-separated list for production)

3. Install and migrate:

   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:deploy
   ```

4. Start API:

   ```bash
   npm start
   ```

## 3. Frontend Setup

1. Create `frontend/.env` from `frontend/.env.example`.

2. Configure:

- `VITE_API_BASE_URL` (public backend URL + `/api`)
- `VITE_API_TIMEOUT_MS`

3. Install and build:

   ```bash
   npm install
   npm run build
   ```

4. Preview production build locally:

   ```bash
   npm run preview
   ```

## 4. Production Checklist

- Use HTTPS in production for frontend and backend
- Set `NODE_ENV=production` on backend host
- Restrict `FRONTEND_ORIGIN` to trusted domains
- Keep `.env` files out of source control
- Run database backups before schema migrations
- Configure process manager (PM2, Docker, or platform runtime)
- Monitor logs and health endpoint: `/api/health`

## 5. Verify

Backend:

- `GET /api/health` returns `status: ok`

Frontend:

- Login, register, story CRUD, node CRUD, and play mode all work against production API
