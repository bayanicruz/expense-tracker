# Expense Tracker — Agent Instructions

Imperative guidance for any agent working in this repo. Read in full before editing.

## Domain Glossary
- **App User**: the person logged into the app.
- **Member**: a participant in an expense-sharing event. Never call a Member a "User" in UI labels or code comments. App Users manage Members.
- **Event**: a grouping of expense items + participants. An Event has one owner (the App User who paid or fronted the money). The owner may also be a participant.
- **Split**: the Event cost divided evenly across participants automatically. Do not implement manual split math unless explicitly asked.

## Architecture
- Frontend: React 19, Material-UI v7, Emotion CSS-in-JS. CRA-based.
- Backend: Node.js + Express, MongoDB Atlas via Mongoose.
- Deploy: frontend → GitHub Pages, backend → Render (free tier — expect a 2–3 min cold start on first request after idle).

## Verification (run after every change)
1. If frontend changed: `cd client && npm run build` — must succeed.
2. If backend changed: `cd server && npm run dev` — server must boot without errors.
3. If unsure what changed, run both. Do not claim a task is done until the relevant command passes.

## Commands
- `npm run dev` — start frontend + backend together (root)
- `npm run server` / `npm run client` — start one side from root
- `cd client && npm start` — frontend dev server
- `cd client && npm run build` — production build (use as frontend lint check)
- `cd client && npm run deploy` — deploy frontend to GitHub Pages
- `cd server && npm run dev` — backend dev server

## Key Directories
- `client/src/components/` — React components
- `client/src/hooks/useApiCall.js` — use this hook for all API calls
- `client/src/config/featureToggles.json` — feature flags
- `server/controllers/` — business logic
- `server/models/` — Mongoose models: `Event.js`, `ExpenseItem.js`, `User.js`
- `server/routes/` — API endpoints

## Coding Standards
- Use Material-UI components exclusively for UI primitives — do not add raw HTML/CSS where an MUI component exists.
- Wrap async UI in the `LoadingOverlay` component for loading states.
- Use the `useApiCall` hook for all backend calls — do not call `fetch`/`axios` directly in components.
- Mirror the patterns of the nearest existing component when creating new ones.
- Backend route params that are Mongo ids must be validated as ObjectId.
- Return proper HTTP status codes on errors; never swallow exceptions.

## Feature Toggles
Toggles live in `client/src/config/featureToggles.json`. Keys:
- `enableGossip` (default false)
- `enableReminders` (default true)

When adding or changing a feature, gate it through this file rather than hardcoding. Keep `GossipDisplay` working even as `ReminderDisplay` evolves — do not break backwards compatibility of the gossip path.

## Feature Locations
- Gossip: `client/src/components/GossipDisplay.js` (mounted under `Header.js`)
- Insights/Reminders: `client/src/components/ReminderDisplay.js` (mounted under `Header.js`)
- Analytics: `client/src/components/analytics/` (admin-only, monitors AtlasDB free-tier health)

## Event & Member Invariants
- An Event has exactly one owner. The owner may or may not be a participant.
- If the owner is not a participant, they lent money to participants (negative balance to participants).
- Event cost is split across participants only — the owner is not charged unless they are also a participant.
- A Member detail view must surface: Events owned, Events participated in, and a per-member "owes money to" list with totals.

## Environment
- Server `.env`: `MONGODB_URI` (required).
- Client `.env` (local dev only): `REACT_APP_API_URL` (defaults to `http://localhost:5000`).
- Production API base: `https://expense-tracker-vrtb.onrender.com`.

## Out of Scope for This File
Project history, changelogs, and open product questions live in `CLAUDE.md` for reference only — do not treat them as instructions.
