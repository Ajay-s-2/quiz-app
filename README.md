# Quiz App - Real-time Interactive Quizzes

A production-ready Kahoot-style real-time quiz application built with React, Node.js, Express, and Socket.IO.

## Features

- 🎯 Host creates quiz rooms with unique codes
- 👥 Real-time player joining and lobby management
- ⏱️ Countdown timers for each question
- 📊 Live leaderboard updates
- 🏆 Final results screen with rankings
- 🔄 Automatic room cleanup after quiz completion
- 📱 Fully responsive mobile and desktop design
- ⚡ Real-time synchronization with Socket.IO
- 🚀 Redis-backed session management

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- Redis
- Joi Validation
- UUID

## Project Structure

```
quiz-app/
├── backend/
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Data access layer
│   │   ├── middlewares/  # Express middlewares
│   │   ├── socket/       # Socket.IO handlers
│   │   ├── validators/   # Input validation
│   │   └── utils/        # Utility functions
│   ├── index.js          # Entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API and Socket services
│   │   ├── contexts/     # React contexts
│   │   ├── routes/       # Route configuration
│   │   └── utils/        # Utility functions
│   ├── index.html
│   ├── package.json
│   └── .env
└── README.md
```

## Installation

### Prerequisites
- Node.js v16+
- Redis Server running locally or remotely
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend will start on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will start on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## API Endpoints

### Rooms
- `POST /api/rooms/create` - Create a new quiz room
- `POST /api/rooms/join` - Join an existing room
- `GET /api/rooms/:roomCode` - Get room details

### Quizzes
- `POST /api/quizzes` - Create a new quiz
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get specific quiz

## Socket Events

### Client → Server
- `create-room` - Create a new room
- `join-room` - Join a room
- `start-quiz` - Start the quiz
- `submit-answer` - Submit an answer
- `next-question` - Move to next question

### Server → Client
- `player-joined` - Player joined the room
- `player-left` - Player left the room
- `quiz-started` - Quiz has started
- `question-started` - New question started
- `timer-update` - Timer update
- `answer-received` - Answer received confirmation
- `leaderboard-update` - Leaderboard updated
- `quiz-ended` - Quiz has ended

## Redis Data Structure

```
room:{roomCode}                    # Room metadata
room:{roomCode}:players            # Player set
room:{roomCode}:answers:{questionId} # Answers hash
room:{roomCode}:scores             # Leaderboard sorted set
quiz:{quizId}                      # Quiz metadata
```

## Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Deployment

See deployment guides in docs/ folder for hosting on popular platforms.

## Contributing

Follow the clean code principles and architecture patterns established in this project.

## License

MIT
