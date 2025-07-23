# Expense Tracker

A full-stack expense tracking application built with the MERN stack, featuring real-time expense splitting, user management, and comprehensive analytics. Perfect for tracking shared expenses among friends, roommates, or groups.

## ✨ Features

### 👥 User Management
- Create and manage user profiles
- View user expense summaries and payment history
- Track outstanding balances per user
- Real-time user balance calculations

### 📊 Event & Expense Tracking
- Create events with multiple participants
- Add expense items to events with automatic splitting
- Flexible participant management (add/remove participants)
- Track payment status for each participant
- Support for partial payments and overpayments
- Event settlement tracking

### 💰 Smart Expense Splitting
- Automatic expense splitting among participants
- Real-time balance calculations
- Track who owes what to whom
- Payment tracking with visual status indicators
- Settlement notifications

### 📈 Analytics & Insights
- Database storage analytics
- Collection breakdown and usage statistics
- Performance insights and optimization tips
- MongoDB Atlas tier information
- Export functionality (CSV format)

### 🎨 Modern UI/UX
- Material-UI design system
- Responsive design for all devices
- Loading states with overlay spinners
- Interactive expandable lists
- Real-time data updates
- Intuitive navigation and breadcrumbs
- Graceful cold start handling with user feedback

## 🏗️ Architecture

```
expense-tracker/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── analytics/      # Analytics dashboard components
│   │   │   ├── CreateEventForm.js
│   │   │   ├── CreateUserForm.js
│   │   │   ├── EventDetailView.js
│   │   │   ├── EventsList.js
│   │   │   ├── UserDetailView.js
│   │   │   ├── UsersList.js
│   │   │   └── LoadingOverlay.js
│   │   └── hooks/              # Custom React hooks
│   │       └── useApiCall.js   # API loading state management
│   └── public/
├── server/                     # Node.js/Express backend
│   ├── controllers/            # Business logic
│   │   ├── analyticsController.js
│   │   ├── eventController.js
│   │   ├── exportController.js
│   │   └── userController.js
│   ├── models/                 # MongoDB/Mongoose models
│   │   ├── Event.js
│   │   ├── ExpenseItem.js
│   │   └── User.js
│   └── routes/                 # API endpoints
│       ├── analytics.js
│       ├── events.js
│       ├── expense-items.js
│       ├── export.js
│       └── users.js
└── package.json                # Root scripts and dependencies
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Material-UI v7** - Component library and design system
- **Emotion** - CSS-in-JS styling
- **Custom Hooks** - State management and API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing

### DevOps & Deployment
- **GitHub Pages** - Frontend hosting
- **Render** - Backend hosting
- **Concurrently** - Development server management
- **Nodemon** - Development auto-restart

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bayanicruz/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Configuration**
   
   **Server Setup:**
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/expense-tracker?retryWrites=true&w=majority
   ```
   
   **Client Setup (if running locally):**
   ```bash
   cd client
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:5000" > .env
   ```

4. **Start the application**
   ```bash
   # From the root directory - runs both frontend and backend
   npm run dev
   ```
   
   **Or run individually:**
   ```bash
   # Backend (from server directory)
   npm run dev
   
   # Frontend (from client directory)
   npm start
   ```

### Available Scripts

- `npm run dev` - Runs both backend and frontend concurrently
- `npm run server` - Runs backend only
- `npm run client` - Runs frontend only

### Server Scripts
- `npm start` - Production server
- `npm run dev` - Development server with nodemon

### Client Scripts
- `npm start` - Development server
- `npm run build` - Production build
- `npm run deploy` - Deploy to GitHub Pages
- `npm test` - Run tests

## 📝 API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/expenses` - Get user expense summary

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PATCH /api/events/:eventId/participants/:userId/payment` - Update payment

### Expense Items
- `GET /api/expense-items` - Get expense items (with eventId filter)
- `POST /api/expense-items` - Create expense item
- `DELETE /api/expense-items/:id` - Delete expense item

### Analytics & Export
- `GET /api/analytics` - Get database analytics
- `GET /api/export/csv` - Export data as CSV

## 🎯 Usage Examples

### Creating an Event
1. Click "Create Event" in the Events section
2. Add event title and date
3. Select an event owner
4. Add participants (owner is automatically included)
5. Add expense items with amounts
6. System automatically calculates splits and balances

### Managing Payments
1. Open an event from the Events list
2. Update payment amounts for each participant
3. Use "Pay" button for quick split amount payment
4. Track settlement status in real-time

### Viewing Analytics
1. Click "Storage Insights" at the bottom of the main page
2. View database usage, performance metrics, and collection breakdowns
3. Export data using the CSV export feature

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👤 Author

**Bayani Cruz**
- GitHub: [@bayanicruz](https://github.com/bayanicruz)