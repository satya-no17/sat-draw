import e from "express";
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from "socket.io";
import words from "./game/words.js";
import { generateRoomCode } from "./game/generateRoom.js";
import { endRound, handlePlayerLeave, startRound } from "./handlers/gameHandler.js";
import { rooms, ROUND_TIME } from "./game/room.js";
const app = e()

const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

app.use(cors())
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('backend ok')
})


io.on('connection', (socket) => {
    console.log('a user connected: ', socket.id)

    socket.on("create_room", (data) => {
        const roomId = generateRoomCode();
        rooms[roomId] = {
            roomId,
            hostId: socket.id,
            status: 'lobby',
            players: [{ id: socket.id, name: data.name, avatar: data.avatar, score: 0, isDrawing: false, hasGuessedCorrect: false }],
            totalRounds: data.totalRounds,
            currentRound: 0,
            currentDrawerIndex: 0,
            currentWord: null,
            maskedWord: null,
            roundTimer: null
        }
        socket.join(roomId)
        socket.data.roomId = roomId;
        socket.emit('room_update', rooms[roomId])
    });



    socket.on("join_room", (data) => {
        const { roomId } = data;
        const room = rooms[roomId]
        if (!room) return socket.emit('error', { message: "no room" })
        if (room.status !== "lobby") return socket.emit('error', { message: 'game started' })

        room.players.push({ id: socket.id, name: data.name, avatar: data.avatar, score: 0, isDrawing: false, hasGuessedCorrect: false })
        socket.join(roomId)
        socket.data.roomId = roomId;
        io.to(roomId).emit('room_update', room)
    });
    socket.on("start_game", (data) => {

        console.log(data)
        const { roomId } = data;
        const room = rooms[roomId]
        if (!room) return socket.emit('error', { message: "no room" })
        if (room.hostId !== socket.id) return socket.emit('error', { message: "Only host can start" });
        room.status = 'playing'
        room.currentRound = 1
        startRound(io, room, roomId)
    });


    socket.on("draw", (data) => {
        const { roomId, ...strokeData } = data
        const room = rooms[roomId]
        if (!room) return socket.emit('error', { message: "no room" })

        const drawerId = room.players[room.currentDrawerIndex]?.id
        if (socket.id !== drawerId) return
        socket.to(roomId).emit('draw', strokeData)
    });


    socket.on("clear_canvas", (data) => {
        const { roomId } = data
        const room = rooms[roomId]
        if (!room) return socket.emit('error', { message: "no room" })

        const drawerId = room.players[room.currentDrawerIndex]?.id
        if (socket.id !== drawerId) return
        socket.to(roomId).emit('clear_canvas')

    });
    socket.on("send_guess", (data) => {
        const { roomId, ...msg } = data;
        const room = rooms[roomId]
        if (!room) return socket.emit('error', { message: "no room" })

        const drawerId = room.players[room.currentDrawerIndex]?.id;
        if (socket.id === drawerId) return;

        const guesser = room.players.find(p => p.id === socket.id);
        if (!guesser || guesser.hasGuessedCorrect) return;

        const guessText = msg.message?.trim().toLowerCase();
        const isCorrect = guessText === room.currentWord.toLowerCase();

        if (isCorrect) {
            guesser.hasGuessedCorrect = true;
            guesser.score += 100;
            io.to(roomId).emit('correct_guess', { playerId: socket.id, points: guesser.score });
            endRound(io, room, roomId)
        } else {
            io.to(roomId).emit('new_guess', { playerId: socket.id, message: msg.message, correct: false });
        }
    });


    socket.on("leave_room", (data) => {
        handlePlayerLeave(io, socket, data.roomId);
    });

    socket.on('request_room_state', (data) => {
        const {roomId} = data
        const room = rooms[roomId];
        if (!room) return socket.emit('error', { message: "no room" });
        socket.emit('room_update', room);
    })
    socket.on("disconnect", () => {
        console.log('user disconnected:', socket.id);
        const roomId = socket.data?.roomId;
        if (roomId) handlePlayerLeave(io, socket, roomId);
    });



})

server.listen(PORT, () => {
    console.log(`Maa ka bhosda aaag aaag server garam h \nbtw running on http://localhost:${PORT}`)
})




