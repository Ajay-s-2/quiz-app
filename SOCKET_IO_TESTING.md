# Socket.IO Testing Guide

## Socket.IO Events Checklist

### Connection Events ✓

- [x] Client connects to server
- [x] Socket.IO CORS working
- [x] Connection acknowledged
- [x] Automatic reconnection on disconnect

**Test Command:**
```javascript
// In browser console
console.log(socket.connected) // Should be true
console.log(socket.id) // Should show socket ID
```

### Player Management Events

#### Join Room Event
```javascript
// Client sends
socket.emit('join-room', {
  roomCode: 'ABC123',
  playerName: 'John'
}, (response) => {
  console.log('Join response:', response)
})

// Server broadcasts
io.to('ABC123').emit('player-joined', {
  playerId: 'uuid',
  playerName: 'John',
  players: [...]
})

// Expected callback response
{
  success: true,
  playerId: 'player-id',
  players: [...]
}
```

**Manual Test:**
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Open browser console at http://localhost:5173
socket = io('http://localhost:5000')
socket.emit('join-room', {roomCode: 'TEST01', playerName: 'TestPlayer'}, res => console.log(res))
```

#### Leave Room Event
```javascript
// Client sends
socket.emit('leave-room', {
  roomCode: 'ABC123',
  playerId: 'player-id'
}, (response) => {
  console.log('Leave response:', response)
})

// Server broadcasts
io.to('ABC123').emit('player-left', {
  playerId: 'player-id',
  players: [...]
})
```

### Quiz Control Events

#### Start Quiz
```javascript
// Host sends
socket.emit('start-quiz', {
  roomCode: 'ABC123',
  hostId: 'host-id'
}, (response) => {
  console.log('Start response:', response)
})

// Server broadcasts
io.to('ABC123').emit('quiz-started', {
  roomCode: 'ABC123',
  timestamp: '2024-01-01T10:00:00Z'
})
```

#### Submit Answer
```javascript
// Player sends
socket.emit('submit-answer', {
  roomCode: 'ABC123',
  questionIndex: 0,
  answerIndex: 2
}, (response) => {
  console.log('Submit response:', response)
})

// Server broadcasts
io.to('ABC123').emit('answer-received', {
  playerId: 'player-id',
  playerName: 'John',
  questionIndex: 0
})
```

#### Next Question
```javascript
// Host sends
socket.emit('next-question', {
  roomCode: 'ABC123',
  hostId: 'host-id',
  questionIndex: 0,
  correctOption: 1
}, (response) => {
  console.log('Next response:', response)
})

// Server broadcasts
io.to('ABC123').emit('question-ended', {
  questionIndex: 0,
  correctOption: 1,
  answers: {
    'player-1': 0,
    'player-2': 1,
    'player-3': 1
  },
  leaderboard: [...]
})
```

#### End Quiz
```javascript
// Host sends
socket.emit('end-quiz', {
  roomCode: 'ABC123',
  hostId: 'host-id'
}, (response) => {
  console.log('End response:', response)
})

// Server broadcasts
io.to('ABC123').emit('quiz-ended', {
  roomCode: 'ABC123',
  leaderboard: [...],
  timestamp: '2024-01-01T10:15:00Z'
})
```

---

## Full Integration Test Scenario

### Setup: 2 Players, 1 Host

**Browser 1 (Host):** http://localhost:5173
**Browser 2 (Player):** http://localhost:5173 (different window/tab)

### Step-by-Step Test

#### 1. Host Creates Room
```
Browser 1:
1. Click "Create & Host Quiz"
2. Select a quiz
3. Click "Create Room"
4. Note room code (e.g., ABC123)

Expected:
- Room code displayed in large font
- "Copy" button functional
- "Waiting for players..." message
- Player list shows "Host" with #1
```

#### 2. Player Joins Room
```
Browser 2:
1. Click "Join Quiz"
2. Enter player name (e.g., "Player One")
3. Enter room code from host (ABC123)
4. Click "Join Quiz"

Expected:
- Browser 1 updates instantly (no page refresh)
- Player appears in host's player list
- "Player One" shows in list with #2
- Host sees: "Player One joined!" toast
- Browser 2 navigates to Lobby page
- Browser 2 shows waiting message
```

#### 3. Add Second Player
```
Browser 3 (new window):
1. Click "Join Quiz"
2. Enter "Player Two"
3. Enter room code
4. Click "Join Quiz"

Expected:
- Host sees player count: "Players (3)"
- Both players in list
- LobbyPage shows both players
- Toast: "Player Two joined!"
```

#### 4. Host Starts Quiz
```
Browser 1:
1. Click "Start Quiz" button

Expected:
- All browsers navigate to QuizPage
- All see same question simultaneously
- Timer shows 10 seconds
- All browsers show: "Question 1 of 4"
```

#### 5. Players Answer Question
```
Browser 2:
1. Click on option (e.g., "Paris")

Browser 3:
1. Click on different option (e.g., "Berlin")

Expected:
- Browser 1 (Host) sees both answers received
- Toast: "Answer submitted!"
- Selected option highlighted
- "Answer submitted! Waiting..." message
- Timer continues countdown
- Leaderboard updates in background
```

#### 6. Question Ends (Auto or Manual)
```
Browser 1:
- When timer reaches 0 or host clicks next
- Question results show
- Leaderboard updates with scores

Expected:
- Browser 2 & 3 see leaderboard
- Correct answer highlighted
- Scores shown for top players
- 2-second delay before next question
```

#### 7. Multiple Questions
```
Repeat process for questions 2-4

Expected:
- Progress bar updates
- Question counter increments
- Scores accumulate
- Leaderboard evolves
```

#### 8. Quiz Completes
```
Browser 1:
- After question 4, click next
- Quiz automatically ends

Expected:
- All browsers navigate to ResultsPage
- Winner banner shows highest scorer
- Top 3 get medals: 🥇🥈🥉
- Final leaderboard displayed
- "Play Another Quiz" button available
```

---

## Redis State Monitoring

### Monitor Room Creation
```bash
redis-cli
MONITOR

# In separate terminal, create room
# Watch for:
# HSET room:ABC123 roomCode ABC123 hostId ... quizId ... status waiting
# EXPIRE room:ABC123 86400
```

### Monitor Player Join
```bash
# Watch for:
# SADD room:ABC123:players {playerId}
# HSET room:ABC123:player:{playerId} name playerName score 0
```

### Check Active Rooms
```bash
redis-cli
KEYS room:*
HGETALL room:ABC123
SMEMBERS room:ABC123:players
```

### Check Leaderboard
```bash
redis-cli
ZREVRANGE room:ABC123:scores 0 -1 WITHSCORES
```

---

## Network Debugging

### Enable Socket.IO Debug Logging

**Backend:**
```javascript
// In SocketManager.js
const io = new Server(httpServer, {
  cors: { origin: config.app.corsOrigin },
  transports: ['websocket'],
  logger: true,
  path: '/socket.io/',
})
```

**Frontend:**
```javascript
// In main.jsx or App.jsx
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000', {
  debug: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
})
```

### Browser DevTools

**Console Monitoring:**
```javascript
// Listen to all socket events
socket.onAny((event, ...args) => {
  console.group(`📡 ${event}`)
  console.log('Data:', args)
  console.groupEnd()
})

// Monitor emit
const originalEmit = socket.emit
socket.emit = function(event, ...args) {
  console.group(`📤 ${event}`)
  console.log('Sending:', args)
  console.groupEnd()
  return originalEmit.apply(socket, [event, ...args])
}
```

### Network Tab Analysis

1. Open DevTools → Network tab
2. Filter by WS (WebSocket)
3. Watch messages:
   - First `2probe` and `2pong` for connection
   - Numbered messages (2, 4, etc.) for events
   - Verify all events sent/received

---

## Common Issues & Solutions

### Issue: "Room not found" error

**Symptom:** Players can't join with valid room code

**Debug:**
```bash
redis-cli
EXISTS room:ABC123
# Should return 1, not 0
```

**Solutions:**
1. Verify room code spelling (case-sensitive)
2. Check room expiry: `TTL room:ABC123`
3. Verify host created room successfully
4. Check backend logs for creation error

### Issue: Player list doesn't update on host

**Symptom:** Host sees "Waiting for players..." even after join

**Debug:**
```javascript
// Browser console (host)
socket.on('player-joined', (data) => {
  console.log('Player joined event:', data)
})

// Check if event fires
```

**Solutions:**
1. Verify socket joined room: `socket.rooms` in console
2. Check CORS origin in .env
3. Verify broadcast uses `io.to(roomCode)` not `socket.emit()`
4. Check if player-joined listener registered

### Issue: Answers not submitting

**Symptom:** No "Answer submitted!" toast, no answer recorded

**Debug:**
```javascript
// Browser console
socket.emit('submit-answer', {
  roomCode: 'ABC123',
  questionIndex: 0,
  answerIndex: 1
}, (response) => {
  console.log('Response:', response)
  if (!response.success) console.error(response.error)
})
```

**Solutions:**
1. Verify playerId set in socket.data
2. Check room/player existence in Redis
3. Verify answer index in valid range (0-3)
4. Check backend logs for errors

### Issue: Timer out of sync

**Symptom:** Different players see different remaining times

**Debug:**
```javascript
// Check server time vs client
console.log('Server timestamp:', new Date(serverTimestamp).getTime())
console.log('Client time:', Date.now())
console.log('Diff:', Date.now() - new Date(serverTimestamp).getTime())
```

**Solutions:**
1. Timer should use server-authoritative value
2. Account for network latency (~100-200ms)
3. Broadcast timer updates every second
4. Don't rely on local Date.now() alone

---

## Load Testing

### Simulate Multiple Players

**Using Apache Bench + Node.js socket client:**

```javascript
// test-client.js
const io = require('socket.io-client')

const socket = io('http://localhost:5000', {
  reconnection: true
})

socket.on('connect', () => {
  console.log('Connected:', socket.id)
  
  socket.emit('join-room', {
    roomCode: 'TEST01',
    playerName: 'TestPlayer'
  }, (response) => {
    if (response.success) {
      console.log('Joined successfully')
      
      // Simulate answer after delay
      setTimeout(() => {
        socket.emit('submit-answer', {
          roomCode: 'TEST01',
          questionIndex: 0,
          answerIndex: Math.floor(Math.random() * 4)
        })
      }, 2000)
    }
  })
})

socket.on('disconnect', () => {
  console.log('Disconnected')
})
```

**Run test:**
```bash
node test-client.js &
node test-client.js &
node test-client.js &
# Creates 3 concurrent clients
```

---

## Performance Monitoring

### Check Active Connections
```bash
# Backend logs (if logger enabled)
tail -f logs/all.log | grep -i socket

# Should show:
# Socket connection attempt
# Client connected: socket-id
# Player joined room
# Player left room
# Client disconnected
```

### Memory Usage
```bash
# Monitor Node process
top -p $(pgrep -f "node src/index.js")

# Should remain stable, not growing rapidly
```

---

## Cleanup After Testing

### Clear Redis Data
```bash
redis-cli
FLUSHDB
# Removes all test data
```

### Kill Stale Connections
```bash
# Check all connections
netstat -an | grep ESTABLISHED | grep 5000

# If many lingering, restart backend:
pkill -f "node src/index.js"
npm run dev
```

---

## Automated Tests (Future)

```javascript
// Example Jest test
describe('Socket.IO Quiz Events', () => {
  let clientSocket

  beforeEach((done) => {
    clientSocket = io.connect(
      `http://localhost:5000`,
      { reconnection: false }
    )
    clientSocket.on('connect', done)
  })

  afterEach(() => {
    clientSocket.disconnect()
  })

  it('should join room successfully', (done) => {
    clientSocket.emit('join-room', {
      roomCode: 'TEST01',
      playerName: 'Test'
    }, (response) => {
      expect(response.success).toBe(true)
      expect(response.playerId).toBeDefined()
      done()
    })
  })
})
```

---

## Conclusion

This testing guide provides:
- ✅ Event-by-event verification
- ✅ Full scenario testing
- ✅ Redis state monitoring
- ✅ Network debugging tools
- ✅ Issue resolution strategies
- ✅ Performance monitoring

Use these tests to verify Module 2 implementation is working correctly before proceeding to Module 3.
