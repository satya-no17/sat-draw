import e from "express";
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from "socket.io";
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

    socket.on("create_room", (data) => { });
    socket.on("join_room", (data) => { });
    socket.on("start_game", (data) => { });
    socket.on("select_word", (data) => { });
    socket.on("draw", (data) => { });
    socket.on("clear_canvas", (data) => { });
    socket.on("send_guess", (data) => { });
    socket.on("leave_room", (data) => { });




    socket.emit("room_update", roomState);           
    io.to(roomId).emit("room_update", roomState);     

    socket.emit("word_choices", { words });          

    io.to(roomId).emit("round_start", { drawerId, maskedWord, timeLimit });

    socket.to(roomId).emit("draw", strokeData);           

    socket.to(roomId).emit("clear_canvas");

    io.to(roomId).emit("new_guess", { playerId, message, correct });

    io.to(roomId).emit("correct_guess", { playerId, points });

    io.to(roomId).emit("round_end", { word, scores });

    io.to(roomId).emit("game_end", { finalScores });



})







server.listen(PORT, () => {
    console.log('server working')
})




