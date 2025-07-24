# Expense Tracker Project Memory

## Project Overview
Full-stack MERN expense tracking app for shared expenses with real-time splitting, user management, and analytics. 

This project is intended to remove friction in user registration that may dismay users from using the app like establish mobile apps i.e splitwise. Anyone can simply use this webb app and add users, expenses and assignments off the bat.

The approach for this app is Exense event based where each expense is usually related to an event i.e Eating at restaurent X, Shopping at Y, Traveling to Z, Grocery, and so on. It can even just be used as if it were a single expense item like Birtday Cake and it has been split into your group of friends.

This app has a gossip feature to keep the user somewhat entertaintained and keep engagement. The gossip feature is meant to listen in to two people gossiping about the users and their expenses using snarky comments. This feature is by default not enabled but instead uses the reminder feature or perhaps more appropriately named as the insight feature which instead show insights on the data within the app. This extra feature is all done under the Header.js

## Gossip Feature
- Location: `client/src/components/GossipDisplay.js`
- Toggle: featureToggles.json | featureToggles.enableGossip
- It's important that as the insights feature gets improved, this gossip feature should still be backwards compatible

## Reminder/Insights Feature
- Location: `client/src/components/ReminderDisplay.js`
- Toggle: featureToggles.json | featureToggles.enableReminders
- TODO: improve insights based on the data already available; api callouts are expensive considering the backend host expense

## Analytics Feature
- Location: `client/src/components/analytics/`
- More of an admin tool to check the health of AtlasDB and it's limit on the free tier

## Event Feature
- Event expenses contain event items and user participants
- a user can own an event which means they payed for the event
- the owner can be a participant also can just own the event meaning the lent money for the participants ofthe event 

## Split Feature
- Cost of the event is automatically split between the participants

## User Event View Feature
- Events where a user is a participant, can be viewed in their detail. 
- Events owed section will appear for those events owned by the user
- Events participated section will appear for those events the user participated in
- Viewing the events via the list will give a quick summary of each expense. But can navigate into for even more details

## Architecture
- **Frontend**: React 19, Material-UI v7, Emotion CSS-in-JS
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose
- **Deployment**: GitHub Pages (frontend), Render (backend)
    - Backend host (Render) is on a free tier and has 2-3 minute cold start when the server has not restarted

## Development Commands
- `npm run dev` - Start both frontend and backend
- `npm run server` - Backend only (from root)
- `npm run client` - Frontend only (from root)
- `cd server && npm run dev` - Backend dev server
- `cd client && npm start` - Frontend dev server
- `cd client && npm run build` - Production build
- `cd client && npm run deploy` - Deploy to GitHub Pages

## Key Directories
```
/client/src/components/ - React components
/client/src/hooks/ - Custom hooks (useApiCall.js)
/server/controllers/ - Business logic
/server/models/ - Mongoose models (Event.js, ExpenseItem.js, User.js)
/server/routes/ - API endpoints
```

## Coding Standards
- Use Material-UI components consistently
- Implement loading states with LoadingOverlay component
- Use useApiCall hook for API calls
- Follow existing component patterns
- MongoDB ObjectId validation for route params
- Proper error handling with status codes

## API Base URLs
- Development: http://localhost:5000
- Production: https://expense-tracker-vrtb.onrender.com

## Environment Setup
- Server needs MONGODB_URI in .env
- Client needs REACT_APP_API_URL in .env for local development

## Recent Work Context
- Fixed owner balance calculation issues
- Implemented participant sharing logic
- Working on expense splitting and payment tracking features