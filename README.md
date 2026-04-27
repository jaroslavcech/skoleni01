# Task Manager

A responsive task manager built with React, TypeScript, and Vite. It supports adding tasks, marking tasks as completed, deleting tasks, and persists tasks through a local JSON backend on disk.

## Scripts

- `npm run dev` starts both the local JSON backend and the Vite frontend.
- `npm run server` starts the local JSON backend on port 3001.
- `npm run dev:client` starts only the Vite frontend.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.

## Project notes

- The UI is a single-page task board with accessible form controls and task actions.
- Workspace-specific Copilot instructions live in `.github/copilot-instructions.md`.
- Custom Copilot agents live in `.github/agents/`.
- Task data is stored in `data/tasks.json` through the local backend.
