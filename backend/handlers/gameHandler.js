import words from "../game/words.js";
import { rooms, ROUND_TIME } from "../game/room.js";
import { generateWord } from './../game/generateWord.js';



export function endRound(io, room, roomId) {
    if (room.roundTimer) {
        clearTimeout(room.roundTimer)
        room.roundTimer = null
    }
    if (room.nextTurnTimer) {
        clearTimeout(room.nextTurnTimer)
        room.nextTurnTimer = null
    }
    console.log('round ended')

    if (room.players.length <= 1) {
        room.status = 'game_end'
        io.to(roomId).emit('game_end', {
            finalScores: room.players
                .map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))
                .sort((a, b) => b.score - a.score)
        })
        io.to(roomId).emit('room_update', room)
        return
    }

    room.status = 'round_end'
    io.to(roomId).emit('round_end', {
        word: room.currentWord,
        scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))
    })
    console.log('data send')
    io.to(roomId).emit('room_update', room);
    room.nextTurnTimer = setTimeout(() => {
        nextTurn(io, room, roomId)
        console.log('next started')
    }, 10000);
}

export function nextTurn(io, room, roomId) {
    if (!rooms[roomId] || room.status === 'game_end') return

    if (room.players.length <= 1) {
        room.status = "game_end"
        io.to(roomId).emit('game_end', {
            finalScores: room.players
                .map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))
                .sort((a, b) => b.score - a.score)
        })
        io.to(roomId).emit('room_update', room)
        return
    }

    room.players.forEach(element => {
        element.hasGuessedCorrect = false
    });
    const isLastPlayerInRound = room.currentDrawerIndex >= room.players.length - 1;
    if (isLastPlayerInRound) {
        room.currentDrawerIndex = 0;
    } else {
        room.currentDrawerIndex += 1;
    }
    room.currentRound += 1;

    const isGameOver = room.currentRound > room.totalRounds;

    if (isGameOver) {
        room.status = "game_end"
        io.to(roomId).emit('game_end', {
            finalScores: room.players.
                map(p => ({ id: p.id, name: p.name, score: p.score,avatar:p.avatar }))
                .sort((a, b) => b.score - a.score)
        })
        io.to(roomId).emit('room_update', room)
        return
    }

    startRound(io, room, roomId)

}

export function startRound(io, room, roomId) {
    if (room.players.length <= 1) {
        room.status = 'game_end'
        io.to(roomId).emit('game_end', {
            finalScores: room.players
                .map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))
                .sort((a, b) => b.score - a.score)
        })
        io.to(roomId).emit('room_update', room)
        return
    }

    room.status = 'playing'
    room.currentWord = generateWord(words)
    room.maskedWord = '_ '.repeat(room.currentWord.length).trim()

    if (room.currentDrawerIndex >= room.players.length) {
        room.currentDrawerIndex = 0
    }

    const drawerId = room.players[room.currentDrawerIndex]?.id
    room.players.forEach(player => {
        io.to(player.id).emit('round_start', {
            drawerId,
            maskedWord: room.maskedWord,
            timeLimit: ROUND_TIME,
            word: player.id === drawerId ? room.currentWord : undefined,
        });
    });
    room.players.forEach(player => {
        if (player.id === drawerId) {
            io.to(player.id).emit('room_update', room);
        } else {
            io.to(player.id).emit('room_update', { ...room, currentWord: undefined });
        }
    });
    console.log('gameee  started')

    room.roundTimer = setTimeout(() => {
        endRound(io, room, roomId)
    }, ROUND_TIME * 1000);

}

export function handlePlayerLeave(io, socket, roomId) {
    console.log('leave')
    const room = rooms[roomId];
    if (!room) return;
    console.log('bug1')
    const leavingIndex = room.players.findIndex(p => p.id === socket.id);
    if (leavingIndex === -1) return;
    console.log('bug2')

    const wasDrawer = room.players[leavingIndex].id === room.players[room.currentDrawerIndex]?.id;
    const wasHost = room.hostId === socket.id;

    room.players.splice(leavingIndex, 1);
    socket.leave(roomId);
    console.log('bug3')

    if (leavingIndex < room.currentDrawerIndex) {
        room.currentDrawerIndex -= 1;
    }
    if (room.currentDrawerIndex >= room.players.length) {
        room.currentDrawerIndex = 0;
    }
    console.log('bug4')

    if (room.players.length === 0) {
        if (room.roundTimer) clearTimeout(room.roundTimer);
        if (room.nextTurnTimer) clearTimeout(room.nextTurnTimer);
        delete rooms[roomId];
        return;
    }
    console.log('bug5')

    if (wasHost) {
        room.hostId = room.players[0].id; // promote next player
    }
    console.log('bug6')

    // If game has already started and only 1 player remains, finish the game
    if (room.status !== 'lobby' && room.status !== 'game_end' && room.players.length <= 1) {
        if (room.roundTimer) {
            clearTimeout(room.roundTimer);
            room.roundTimer = null;
        }
        if (room.nextTurnTimer) {
            clearTimeout(room.nextTurnTimer);
            room.nextTurnTimer = null;
        }
        room.status = 'game_end';
        const finalScores = room.players
            .map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))
            .sort((a, b) => b.score - a.score);

        io.to(roomId).emit('game_end', { finalScores });
        io.to(roomId).emit('room_update', room);
        return;
    }

    if (wasDrawer && room.status === 'playing') {
        console.log('bug999')
        endRound(io, room, roomId);
    } else {
        console.log('bug99')
        io.to(roomId).emit('room_update', room);
    }
    console.log('baigan')

}