# 🎨 Sat-Draw

A real-time multiplayer draw-and-guess game — built from scratch with **Next.js**, **Express**, and **Socket.IO**. Create a room, share the code, and play live with friends: one person draws, everyone else races to guess the word.

Inspired by Skribbl.io, built to understand what actually goes into real-time multiplayer systems — room management, server-authoritative game state, turn rotation, live canvas sync, and race-condition-safe scoring.

---

## ✨ Features

- **Room-code multiplayer** — create a room, get a shareable 5-character code, friends join instantly
- **Live synced drawing** — every stroke streams to all players in real time via WebSockets
- **Turn-based gameplay** — rotating drawer, server-controlled word selection, masked word reveal for guessers
- **Real-time guessing & chat** — instant feedback on correct/incorrect guesses
- **Server-authoritative scoring & timers** — the server is the single source of truth for the word, the clock, and the score, so nothing can be manipulated client-side
- **Host controls** — only the host can start the game; host migrates automatically if they disconnect
- **Guest play** — jump in instantly with a random avatar and name, no account required
- **Graceful disconnect handling** — players leaving or refreshing mid-game doesn't break the room for everyone else
- **Round-end recap & final leaderboard** — reveals the word, shows updated scores, and a full leaderboard at game end

---

## 🛠️ Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) (App Router)
- React (hooks-based, client components)
- Tailwind CSS
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/) — real-time bidirectional event-based communication
- In-memory room/game state (no database — rooms are ephemeral by design)

---

## 🏗️ Architecture

The app is split into two independent services:

```
┌─────────────────────┐         WebSocket          ┌──────────────────────┐
│   Next.js Frontend   │ ◄─────────────────────────► │  Express + Socket.IO │
│  (dashboard, lobby,  │        (Socket.IO)          │       Backend        │
│   canvas, chat UI)   │                              │  (rooms, game logic,  │
└─────────────────────┘                              │   turn/timer engine)  │
                                                       └──────────────────────┘
```

**Why two separate servers?** Socket.IO needs long-lived WebSocket connections, which don't play well with serverless platforms (like Vercel's default Next.js deployment). Keeping the real-time server as a standalone Express app means it can be deployed anywhere that supports persistent connections (Render, Railway, Fly.io, a VPS, etc.), independent of how the frontend is hosted.

**Server is the single source of truth.** The client never decides the word, the timer, or the score — it only ever displays what the server tells it. Every meaningful game action (drawing, guessing, starting a round) is validated server-side before being broadcast back out to the room.

---

## 📁 Project Structure

```
scribble/
├── backend/
│   ├── game/
│   │   ├── generateRoom.js     # unique room code generator
│   │   ├── generateWord.js     # random word picker
│   │   ├── room.js             # shared in-memory room state + constants
│   │   └── words.js            # word bank
│   ├── handlers/
│   │   └── gameHandler.js      # core game loop: startRound, endRound, nextTurn, disconnect handling
│   ├── server.js                # Express + Socket.IO entry point, all socket event listeners
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── dashboard/
    │   │   └── page.js          # create/join room UI
    │   ├── room/[roomId]/
    │   │   └── page.js          # single dynamic route — renders lobby/canvas/results based on room status
    │   ├── layout.js
    │   └── page.js               # landing / guest login
    ├── components/
    │   ├── canvas.js             # main game screen (drawing + chat + scoreboard)
    │   ├── drawcanvas.js         # the actual <canvas> drawing logic
    │   ├── lobby.js              # pre-game lobby UI
    │   ├── endRound.js           # round-end recap screen
    │   ├── endGame.js            # final leaderboard screen
    │   ├── create.js             # create-room form
    │   └── join.js               # join-room form
    ├── hooks/
    │   └── useRoom.js            # shared hook: subscribes to live room state for any page
    ├── lib/
    │   ├── socket.js             # Socket.IO client singleton (persists across route changes)
    │   └── avatar.js             # avatar list + selection helpers
    └── public/                   # static avatar images
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/satya-no17/sat-draw
cd scribble
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
```

Run it:
```bash
npm start        # or: npm run dev (auto-restart on changes)
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `.env.local` file:
```env
BC_URL=http://localhost:5000
```

Run it:
```bash
npm run dev
```

Visit **http://localhost:3000** — open it in a couple of browser tabs to test multiplayer locally.

---

## 🔌 Socket Events Reference

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `create_room` | `{ name, avatar, totalRounds }` | Creates a new room, returns a room code |
| `join_room` | `{ roomId, name, avatar }` | Joins an existing room (lobby-only) |
| `start_game` | `{ roomId }` | Host-only — begins the game |
| `draw` | `{ roomId, from, to, color, size }` | Streams a stroke segment |
| `clear_canvas` | `{ roomId }` | Drawer clears the canvas |
| `send_guess` | `{ roomId, message }` | Submits a guess |
| `leave_room` | `{ roomId }` | Explicit room exit |
| `request_room_state` | `{ roomId }` | Requests the current room snapshot (used on page mount/refresh) |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `room_update` | full room object | Broadcast whenever room state changes (join, start, round transitions, scores) |
| `round_start` | `{ drawerId, maskedWord, timeLimit, word? }` | New turn begins (`word` sent only to the drawer) |
| `draw` / `clear_canvas` | stroke data | Relayed to everyone else in the room |
| `new_guess` | `{ playerId, message, correct }` | Chat feed entry |
| `correct_guess` | `{ playerId, points }` | Awarded when a guess is right |
| `round_end` | `{ word, scores }` | Reveals the word and updated scores |
| `game_end` | `{ finalScores }` | Sent when all rounds are complete |
| `error` | `{ message }` | Sent on invalid actions (bad room code, unauthorized start, etc.) |

---

## 🎮 Game Flow

1. **Create or join** a room from the dashboard using a name, avatar, and room code
2. **Lobby** — players wait, host sees a "Start" button once 2+ players have joined
3. **Round starts** — server picks a drawer and a word; the drawer sees the real word, everyone else sees blanks
4. **Drawing & guessing** — the drawer draws live, others type guesses in chat; first correct guess ends the round early
5. **Round ends** — word is revealed, scores update, a short countdown leads into the next turn
6. **Repeat** until every player has drawn for the configured number of rounds
7. **Game ends** — final leaderboard is shown, sorted by score

---

## Note
Readme written by Claude

---


## 📄 License
