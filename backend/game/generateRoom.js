import { rooms } from "./room.js";

export function generateRoomCode() {
    const n = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
        code = Array.from({ length: 5 }, () => n[Math.floor(Math.random() * n.lenght)]).join();
    } while (rooms[code]);
    return code;
}