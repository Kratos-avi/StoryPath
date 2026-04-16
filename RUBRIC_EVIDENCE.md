# Practical Lab Sprint 3 Rubric Evidence

## Deployment & Integrity Checks (10/10 target)
- Public deployment URL: https://storypath-2phw.onrender.com
- Health endpoint: /api/health
- Render configuration: render.yaml
- Commit history: frequent, descriptive commits in GitHub repository history.

## Sprint Completion (40/40 target)
- API integration complete:
  - Frontend API client: frontend/src/api/client.js
  - Backend route mounting: backend/src/server.js
- Routing complete:
  - Frontend routes: frontend/src/App.jsx
  - API routes: backend/src/routes/authRoutes.js, backend/src/routes/storyRoutes.js, backend/src/routes/nodeRoutes.js
- CRUD and story flow complete:
  - Stories controller: backend/src/controllers/storyController.js
  - Nodes controller: backend/src/controllers/nodeController.js
  - Story pages: frontend/src/pages/Stories.jsx, frontend/src/pages/EditStoryNodes.jsx, frontend/src/pages/PlayStory.jsx
- Authentication complete:
  - Auth controller: backend/src/controllers/authController.js
  - Auth middleware: backend/src/middleware/authMiddleware.js
  - Frontend auth state: frontend/src/context/AuthContext.jsx
  - Protected routing: frontend/src/components/ProtectedRoute.jsx

## Technical Understanding (30/30 target)
Use this explanation pattern during demo:
1. Request starts from a React page component.
2. Axios client sends request to /api via frontend/src/api/client.js.
3. Express route receives request in backend/src/routes/*.js.
4. Controller handles business logic in backend/src/controllers/*.js.
5. Prisma persists data using backend/src/utils/prismaClient.js and backend/prisma/schema.prisma.
6. Response returns to React and updates UI state.

Suggested instructor Q&A files:
- "Where are your routes?" -> backend/src/server.js and backend/src/routes/*.js
- "How is auth enforced?" -> backend/src/middleware/authMiddleware.js and frontend/src/components/ProtectedRoute.jsx
- "How is DB connected?" -> backend/src/utils/prismaClient.js and backend/prisma/schema.prisma

## Participation Items (20/20 target)
- Be ready on Dev Day with deployed app open.
- Keep terminal ready with backend startup command.
- Upload SPRINT3_SUBMISSION.txt to assignment folder.
