import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BC_URL|| "http://localhost:5000");
  }
  return socket;
}