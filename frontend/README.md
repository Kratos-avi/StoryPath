# StoryPath Frontend

Frontend client for StoryPath, an interactive branching story builder and player.

## Features

- Public story listing and play mode
- Authenticated creator dashboard
- Create, rename, and delete stories
- Add, connect, and delete nodes
- Set story start node from node editor

## Tech Stack

- React
- Vite
- React Router
- Axios

## Environment Variables

Create a `.env` file in `frontend/` based on `.env.example`.

Required:

- `VITE_API_BASE_URL` (example: `http://localhost:5000/api`)
- `VITE_API_URL` (legacy alias, also supported)
- `VITE_API_TIMEOUT_MS` (example: `10000`)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production assets
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Run Locally

1. Install dependencies:

	```bash
	npm install
	```

2. Configure `.env`.

3. Start development server:

	```bash
	npm run dev
	```
