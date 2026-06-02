# Sample Quiz Data & Testing Guide

## Sample Quiz for Testing

```json
{
  "title": "General Knowledge Quiz",
  "description": "Test your knowledge with this general knowledge quiz",
  "questions": [
    {
      "questionText": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "correctOption": 1,
      "timeLimit": 10
    },
    {
      "questionText": "Which planet is known as the Red Planet?",
      "options": ["Venus", "Mars", "Jupiter", "Saturn"],
      "correctOption": 1,
      "timeLimit": 10
    },
    {
      "questionText": "Who wrote Romeo and Juliet?",
      "options": ["Mark Twain", "William Shakespeare", "Jane Austen", "Charles Dickens"],
      "correctOption": 1,
      "timeLimit": 15
    },
    {
      "questionText": "What is the largest ocean on Earth?",
      "options": ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      "correctOption": 3,
      "timeLimit": 10
    }
  ]
}
```

## Testing with cURL

### 1. Create a Quiz
```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Knowledge Quiz",
    "description": "Test your knowledge",
    "questions": [
      {
        "questionText": "What is 2+2?",
        "options": ["3", "4", "5", "6"],
        "correctOption": 1,
        "timeLimit": 10
      }
    ]
  }'
```

### 2. Create a Room
```bash
curl -X POST http://localhost:5000/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"quizId": "YOUR_QUIZ_ID"}'
```

### 3. Join a Room
```bash
curl -X POST http://localhost:5000/api/rooms/join \
  -H "Content-Type: application/json" \
  -d '{"roomCode": "ABC123", "playerName": "Player One"}'
```

### 4. Get Room Details
```bash
curl http://localhost:5000/api/rooms/ABC123
```

### 5. Get Leaderboard
```bash
curl http://localhost:5000/api/scoring/ABC123/leaderboard
```

## Redis Testing

### Connect to Redis
```bash
redis-cli
```

### View Room Data
```bash
KEYS room:ABC123*
HGETALL room:ABC123
SMEMBERS room:ABC123:players
HGETALL room:ABC123:player:PLAYER_ID
```

### View Quiz Data
```bash
KEYS quiz:*
HGETALL quiz:QUIZ_ID
HGETALL quiz:QUIZ_ID:question:0
```

## Frontend Testing

1. Navigate to `http://localhost:5173`
2. Click "Join Quiz"
3. Enter player name and room code
4. Verify connection and component rendering

## Docker Testing (Optional)

### Start Redis in Docker
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

## Postman Collection

Save as `quiz-app.postman_collection.json`:

```json
{
  "info": {
    "name": "Quiz App API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Create Quiz",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/quizzes"
      }
    },
    {
      "name": "Create Room",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/rooms/create"
      }
    },
    {
      "name": "Join Room",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/rooms/join"
      }
    }
  ]
}
```

## Debugging

### Enable Debug Logging
Set `LOG_LEVEL=debug` in backend `.env`

### Monitor Redis
```bash
redis-cli MONITOR
```

### Monitor Socket.IO
Enable Socket.IO debug in frontend:
```javascript
import { io } from 'socket.io-client'
io.connect(SOCKET_URL, { reconnection: true })
```

## Common Issues

### Issue: Redis Connection Error
**Solution:** Ensure Redis is running and accessible at configured host/port

### Issue: CORS Error
**Solution:** Verify CORS_ORIGIN matches frontend URL in backend `.env`

### Issue: Port Already in Use
**Solution:** Change PORT in backend `.env` or kill process using port

### Issue: Module Not Found
**Solution:** Run `npm install` in respective directory and verify `package.json`
