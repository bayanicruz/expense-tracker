# Expense Tracker

A MERN stack application for tracking expenses, using Material UI for the frontend.

## Directory Structure

```
expense-tracker/
├── client/                # React frontend (Material UI)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   └── context/       # React context/state management
│   └── ...
├── server/                # Node.js/Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # Express route handlers
│   ├── controllers/       # Route controller logic
│   └── ...
├── package.json           # Root scripts (run both servers)
└── README.md
```

## Setup

1. **Clone the repository**
2. **Install dependencies**
   - Backend: `cd server && npm install`
   - Frontend: `cd client && npm install`
   - Root: `npm install` (for concurrently)
3. **Configure environment variables**
   - Copy `server/.env.example` to `server/.env` and set your MongoDB Atlas URI.
4. **Run both servers**
   - From the root: `npm start`
   - Or individually: `npm run dev` in `server/`, `npm start` in `client/`

## Scripts

- `npm start` (root): Runs both backend and frontend concurrently.
- `npm run dev` (server): Runs backend with nodemon.
- `npm start` (client): Runs frontend React app.

## Tech Stack
- MongoDB Atlas
- Express.js
- React (with Material UI)
- Node.js

---

For more details, see the respective `client/` and `server/` folders. 