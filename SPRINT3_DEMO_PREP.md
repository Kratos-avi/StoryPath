# Sprint 3 Live Demo Prep (Target: 100%)

## 1) Demo Flow (3-5 minutes)
1. Open deployed app: https://storypath-2phw.onrender.com
2. Show Register and Login flows.
3. Show Stories list and create/edit/play flow.
4. Show protected route behavior (dashboard requires auth).
5. Open API health endpoint: /api/health.
6. Show commit history in GitHub (many descriptive commits).

## 2) Quick Technical Questions (with file locations)
- Where are your routes defined?
  - Backend API route wiring: backend/src/server.js
  - Route modules: backend/src/routes/authRoutes.js, backend/src/routes/storyRoutes.js, backend/src/routes/nodeRoutes.js

- Where is authentication handled?
  - Auth controller (register/login): backend/src/controllers/authController.js
  - JWT protection middleware: backend/src/middleware/authMiddleware.js
  - Frontend auth state/provider: frontend/src/context/AuthContext.jsx
  - Route guard: frontend/src/components/ProtectedRoute.jsx

- How is frontend connected to backend?
  - Axios client and API base URL strategy: frontend/src/api/client.js

- How is database persistence implemented?
  - Prisma schema: backend/prisma/schema.prisma
  - Prisma client: backend/src/utils/prismaClient.js
  - Controllers use Prisma for CRUD (stories/nodes/auth).

## 3) Rubric Match Checklist
- Deployment & Integrity Checks (10/10)
  - Public URL loads and works.
  - Repository has healthy, descriptive commit history.

- Sprint Completion (40/40)
  - Integration features complete and functional.
  - Routing and API integration demonstrated live.
  - No runtime errors during demo flow.

- Technical Understanding (30/30)
  - Be ready to open each file above and explain data flow.
  - Explain request lifecycle: React page -> api/client -> Express route -> controller -> Prisma -> DB.

- Participation (20/20)
  - Attend and be ready on Dev Day with app running.
  - Submit text file with repo URL in assignment folder.

## 4) Final Pre-Demo Commands
- Frontend build check:
  - cd frontend
  - npm run build

- Backend run check:
  - cd backend
  - npm start

## 5) Submission File
Use SPRINT3_SUBMISSION.txt for the assignment upload.
