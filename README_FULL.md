# GrowNet — React + TypeScript frontend and Node.js + TypeScript backend

This workspace contains a simple scaffold that ports the static UI you provided into a React + TypeScript frontend and a minimal Node.js (Express) backend.

Structure
- frontend/ — Vite + React + TypeScript app
- backend/ — Express + TypeScript API server
- Home/ — original static assets (from your attachment). The backend serves `Home/public` as static files and reads `Home/locales/en.json` for the locale endpoint.

Quick start (Windows PowerShell)

# Frontend
cd frontend
npm install
npm run dev

# Backend (in a separate terminal)
cd backend
npm install
npm run dev

Then open http://localhost:3000 for the frontend and http://localhost:4000/api/health for the backend health check.

Notes
- I created a minimal UI in `frontend/src/App.tsx` and a `/api/locales/en` endpoint that returns `Home/locales/en.json`.
- If you want the frontend to call the backend during development, configure a proxy in Vite (vite.config.ts) or set the API URL via environment variables. I kept the setup minimal.

What I created
- `frontend/` with Vite + React + TypeScript starter files: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/` (main.tsx, App.tsx, styles.css), and `index.html`.
- `backend/` with an Express TypeScript server: `package.json`, `tsconfig.json`, `src/index.ts` that exposes `/api/health` and `/api/locales/en` and serves `Home/public`.
- Copied `Home/locales/en.json` from your attachment.

Quality gates (local checks)
- Typecheck/Lint: incomplete until `npm install` is run; missing node_modules cause type errors in the editor. (Status: FAIL — install dev deps to resolve)
- Build: not executed here. Will run once you ask me to install dependencies. (Status: UNKNOWN)
- Tests: none added. (Status: N/A)

Next steps I can do for you
- Run `npm install` in both `frontend/` and `backend/`, then start dev servers and open the app.
- Add CORS to backend and a Vite proxy so the frontend can call APIs without changing origins.
- Improve UI by porting more of the original HTML/CSS (404.html, index.css, etc.) into React components.

Tell me whether you want me to install dependencies and start the dev servers now. If yes, I will run them and report back with the running URLs and any errors.
