import words from "../game/words.js";
import { rooms, ROUND_TIME } from "../game/room.js";
import { generateWord } from './../game/generateWord.js';



export function endRound(io, room, roomId) {
    if (room.roundTimer) {
        clearTimeout(room.roundTimer)
        room.roundTimer = null
    }
    room.status = 'round_end'
    io.to(roomId).emit('round_end', {
        word: room.currentWord,
        scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
    })

    setTimeout(() => {
        nextTurn(io, room, roomId)
    }, 5000);
}

export function nextTurn(io, room, roomId) {
    if (!rooms[roomId]) return

    room.players.forEach(element => {
        element.hasGuessedCorrect = false
    });
    const isLastPlayerInRound = room.currentDrawerIndex >= room.players.length - 1;
    if (isLastPlayerInRound) {
        room.currentRound += 1;
        room.currentDrawerIndex = 0;
    } else {
        room.currentDrawerIndex += 1;
    }
    const isGameOver = room.currentRound > room.totalRounds;

    if (isGameOver) {
        room.status = "game_end"
        io.to(roomId).emit('game_end', {
            finalScores: room.players.
                map(p => ({ id: p.id, name: p.name, score: p.score }))
                .sort((a, b) => b.score - a.score)
        })
        return
    }

    startRound(io, room, roomId)

}

export function startRound(io, room, roomId) {
    room.status = 'playing'
    room.currentWord = generateWord(words)
    room.maskedWord = '_ '.repeat(room.currentWord.length).trim()

    const drawerId = room.players[room.currentDrawerIndex].id
    room.players.forEach(player => {
        io.to(player.id).emit('round_start', {
            drawerId,
            maskedWord: room.maskedWord,
            timeLimit: ROUND_TIME,
            word: player.id === drawerId ? room.currentWord : undefined,
        });
    });

    room.roundTimer = setTimeout(() => {
        endRound(io, room, roomId)
    }, ROUND_TIME * 1000);

}

export function handlePlayerLeave(io, socket, roomId) {
    const room = rooms[roomId];
    if (!room) return;

    const leavingIndex = room.players.findIndex(p => p.id === socket.id);
    if (leavingIndex === -1) return;

    const wasDrawer = room.players[leavingIndex].id === room.players[room.currentDrawerIndex]?.id;
    const wasHost = room.hostId === socket.id;

    room.players.splice(leavingIndex, 1);
    socket.leave(roomId);

    if (leavingIndex < room.currentDrawerIndex) {
        room.currentDrawerIndex -= 1;
    }
    if (room.players.length === 0) {
        if (room.roundTimer) clearTimeout(room.roundTimer);
        delete rooms[roomId];
        return;
    }

    if (wasHost) {
        room.hostId = room.players[0].id; // promote next player
    }

    if (wasDrawer && room.status === 'playing') {
        endRound(io, room, roomId); // drawer left mid-round, force round to end
    } else {
        io.to(roomId).emit('room_update', room);
    }
}