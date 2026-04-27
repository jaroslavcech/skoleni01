# Task Manager

A responsive task manager built with React, TypeScript, and Vite. It supports adding tasks, marking tasks as completed, deleting tasks, and persists tasks in a **PostgreSQL** database through a local Node.js backend.

## Prerequisites

- Node.js 18+
- A running PostgreSQL instance (local or remote)

## Database setup

1. Create a database named `tasks` (or any name you prefer):

   ```sql
   CREATE DATABASE tasks;
   ```

2. Copy `.env.example` to `.env` and fill in your connection details:

   ```bash
   cp .env.example .env
   ```

   The backend accepts either a single `DATABASE_URL` connection string or
   individual `PGHOST` / `PGPORT` / `PGDATABASE` / `PGUSER` / `PGPASSWORD`
   environment variables. The `tasks` table is created automatically on first
   start.

## Scripts

- `npm run dev` starts both the PostgreSQL-backed Node.js server and the Vite frontend.
- `npm run server` starts the backend on port 3001.
- `npm run dev:client` starts only the Vite frontend.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.

## Project notes

- The UI is a single-page task board with accessible form controls and task actions.
- Task data is stored in the `tasks` table in PostgreSQL through the local backend.
- Workspace-specific Copilot instructions live in `.github/copilot-instructions.md`.
- Custom Copilot agents live in `.github/agents/`.
