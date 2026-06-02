# Module 2: Socket.IO & Real-time Lobby System - Complete

## Files Created/Modified

### Backend Socket.IO Implementation

**Socket Manager:**
- [backend/src/socket/SocketManager.js](backend/src/socket/SocketManager.js) - Complete Socket.IO event handling
  - Connection management
  - Event handlers: join-room, leave-room, start-quiz, submit-answer, next-question, end-quiz
  - Real-time player list updates
  - Score calculation and leaderboard updates
  - Room cleanup after quiz completion

**Server Updates:**
- [backend/src/index.js](backend/src/index.js) - HTTP server with Socket.IO integration
  - Socket initialization
  - Proper CORS configuration

### Frontend Real-time Features

**Pages Implemented:**
- [frontend/src/pages/JoinPage.jsx](frontend/src/pages/JoinPage.jsx) - Player join with Socket.IO
  - Real-time room joining
  - Automatic redirect to quiz
  - Error handling and validation

- [frontend/src/pages/HostPage.jsx](frontend/src/pages/HostPage.jsx) - Host dashboard (2-step process)
  - Quiz selection step
  - Real-time lobby with player list
  - Start quiz button
  - Auto-updates when players join

- [frontend/src/pages/LobbyPage.jsx](frontend/src/pages/LobbyPage.jsx) - Waiting room for players
  - Real-time player list
  - Listening for quiz start event
  - Auto-navigation to quiz

- [frontend/src/pages/QuizPage.jsx](frontend/src/pages/QuizPage.jsx) - Live quiz experience
  - Countdown timer per question
  - Multiple choice answers
  - Real-time answer submission
  - Live leaderboard display
  - Progression to next question

- [frontend/src/pages/LeaderboardPage.jsx](frontend/src/pages/LeaderboardPage.jsx) - Live scoring
  - Real-time leaderboard updates
  - Player rankings
  - Score display

- [frontend/src/pages/ResultsPage.jsx](frontend/src/pages/ResultsPage.jsx) - Final results
  - Winner announcement
  - Top 3 medals
  - Complete leaderboard
  - User's personal stats

**Updated Services:**
- [frontend/src/services/socket.js](frontend/src/services/socket.js) - Enhanced event definitions
  - Added END_QUIZ, LEAVE_ROOM, QUESTION_ENDED events

- [frontend/src/hooks/useSocket.js](frontend/src/hooks/useSocket.js) - Enhanced hook
  - Added callback support for acknowledgments
  - Added `once` event listener

---

## Real-time Communication Flow

### Player Join Flow
```
1. Player enters name and room code on JoinPage
2. Socket emits 'join-room' event with validation
3. Backend creates/retrieves player and joins socket to room
4. Server broadcasts 'player-joined' to all in room
5. All clients update player list in real-time
6. Host sees updated player count
7. Player navigates to LobbyPage to wait
```

### Quiz Start Flow
```
1. Host clicks "Start Quiz"
2. Socket emits 'start-quiz' event
3. Backend validates host credentials and updates room status
4. Server broadcasts 'quiz-started' to all in room
5. All clients navigate to QuizPage
6. Quiz begins with first question
```

### Question Flow
```
1. Question displayed with countdown timer
2. Player selects answer
3. Socket emits 'submit-answer' with answer index
4. Backend stores answer, prevents duplicate submissions
5. Server broadcasts 'answer-received' (for real-time feedback)
6. Timer counts down for all players
7. When timer expires or host advances:
   - Backend calculates scores
   - Leaderboard updated
   - 'question-ended' event sent with results
   - All clients see updated leaderboard
8. Next question auto-loads (2s delay)
```

### Quiz End Flow
```
1. After last question, host clicks next
2. Socket emits 'end-quiz' event
3. Backend marks room as completed
4. Calculates final leaderboard
5. Server broadcasts 'quiz-ended' with final results
6. All clients navigate to ResultsPage
7. Room scheduled for cleanup after 30 minutes
```

---

## Socket Events Architecture

### Client → Server Events
```javascript
{
  'join-room': { roomCode, playerName } → creates player, broadcasts update
  'leave-room': { roomCode, playerId } → removes player
  'start-quiz': { roomCode, hostId } → validates host, starts quiz
  'submit-answer': { roomCode, questionIndex, answerIndex } → stores answer
  'next-question': { roomCode, hostId, questionIndex, correctOption } → advances
  'end-quiz': { roomCode, hostId } → finalizes quiz
}
```

### Server → Client Events
```javascript
{
  'player-joined': { playerId, playerName, players[], playerCount }
  'player-left': { playerId, players[], playerCount }
  'quiz-started': { roomCode, timestamp }
  'question-started': { questionIndex, question, options, timer }
  'answer-received': { playerId, playerName, questionIndex }
  'question-ended': { questionIndex, correctOption, answers{}, leaderboard[] }
  'leaderboard-update': { leaderboard[] }
  'quiz-ended': { roomCode, leaderboard[], timestamp }
}
```

---

## State Management

### Frontend Context Updates
- **AuthContext**: Stores user, playerId, isHost, roomCode
- **QuizContext**: Stores currentRoom, currentQuiz, players, currentQuestion, leaderboard

### Backend Redis Updates
- Room status transitions: waiting → active → completed
- Player tracking: join/leave operations
- Answer storage: prevents duplicate submissions
- Score calculation: real-time leaderboard updates
- Automatic cleanup: 30-minute expiry after quiz completion

---

## Key Features Implemented

✅ **Real-time Player Management**
- Instant player joining with Socket.IO
- Live player list updates for host
- Automatic player removal on disconnect
- Prevent rejoin during active quiz

✅ **Lobby System**
- Host dashboard with quiz selection
- Real-time player counter
- Copy room code functionality
- Visual feedback when players join

✅ **Quiz Flow Management**
- Host-controlled quiz progression
- Synchronized timer across all clients
- Answer submission with duplicate prevention
- Real-time score calculation

✅ **Live Leaderboard**
- Updates after each question
- Ranking with medals (🥇🥈🥉)
- Player score display
- Top performer highlighting

✅ **Results Display**
- Winner announcement
- Top 3 rankings
- User's personal stats
- Play again functionality

✅ **Error Handling**
- Network disconnection handling
- Invalid room code detection
- Host-only action validation
- Timeout protection

---

## Testing Steps

### Prerequisites
1. Backend running: `npm run dev` (http://localhost:5000)
2. Frontend running: `npm run dev` (http://localhost:5173)
3. Redis running

### Test Scenario 1: Host Creates Room

1. Open frontend at http://localhost:5173
2. Click "Create & Host Quiz"
3. Select a quiz
4. Click "Create Room"
5. Verify room code is displayed
6. Copy button works
7. Verify "Waiting for players..." message

**Expected:**
- Room code generated (6 alphanumeric characters)
- Host appears in player list
- Room accessible via REST API

### Test Scenario 2: Player Joins Room

1. Open second browser window/tab (http://localhost:5173)
2. Click "Join Quiz"
3. Enter name and room code from host
4. Click "Join Quiz"
5. Verify in LobbyPage
6. Verify host sees new player in real-time

**Expected:**
- Player joins without page refresh on host
- Player count increments
- New player shows in list
- Socket connection confirmed in console

### Test Scenario 3: Start Quiz Flow

1. Host has 2+ players in lobby
2. Click "Start Quiz"
3. Verify all clients navigate to QuizPage
4. Question displays with 10-second timer
5. Each player answers question

**Expected:**
- All players see same question simultaneously
- Timer synchronized
- Answers prevent duplicates
- Leaderboard updates after question

### Test Scenario 4: Quiz Completion

1. Complete all questions
2. Host clicks next after last question
3. Verify ResultsPage displays
4. Verify winner banner
5. Verify final leaderboard

**Expected:**
- All players see results simultaneously
- Winner highlighted with medal
- Final scores displayed
- Room scheduled for cleanup

### Browser Console Debugging

```javascript
// Check Socket.IO connection
console.log(socket)
console.log(socket.id)
console.log(socket.connected)

// Monitor events
socket.onAny((event, ...args) => {
  console.log(`Event: ${event}`, args)
})
```

---

## Redis Operations During Quiz

### Player Join
```
SADD room:ABC123:players {playerId}
HSET room:ABC123:player:{playerId} name playerName score 0
```

### Answer Submission
```
HSET room:ABC123:answers:0 {playerId} {answerIndex}
```

### Leaderboard Update
```
ZADD room:ABC123:scores {score} {playerId}
ZREVRANGE room:ABC123:scores 0 -1 WITHSCORES
```

---

## Performance Considerations

✅ **Optimizations Implemented**
- Socket namespacing by room
- Callback acknowledgments prevent missed events
- Answer duplicate check prevents redundant processing
- Leaderboard caching during active quiz
- 30-minute auto-cleanup prevents stale rooms

⚠️ **Potential Improvements** (Future Modules)
- Question result caching
- Batch score updates
- Compress leaderboard data
- Implement rate limiting per socket
- Add message compression

---

## Troubleshooting

### Socket Connection Issues
**Problem:** Socket events not firing
**Solution:**
1. Check CORS_ORIGIN in backend .env matches frontend URL
2. Verify Redis is running
3. Check browser console for connection errors
4. Ensure Socket.IO client version matches server

### Players Not Seeing Updates
**Problem:** Player list not updating for other players
**Solution:**
1. Verify socket room join: `socket.join(roomCode)`
2. Check emit is using `io.to(roomCode).emit()`
3. Verify callback is triggered
4. Check network tab for dropped packets

### Quiz Not Starting
**Problem:** Host can't start quiz
**Solution:**
1. Verify host ID matches in database
2. Check room status in Redis: `HGET room:CODE status`
3. Verify at least 1 player in room
4. Check error logs: `tail -f logs/all.log`

### Timer Desynchronization
**Problem:** Timers out of sync between players
**Solution:**
1. Use server time not client time
2. Broadcast timer updates every second
3. Add time buffer on client for latency
4. Implement server-authoritative timer

---

## Next Module: Module 3

Will implement:
1. Quiz creation and management
2. Question bank system
3. Seed data generation
4. Admin dashboard
5. Quiz analytics and statistics
