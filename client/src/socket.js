import { io } from "socket.io-client";

const socket = io(
  "http://127.0.0.1:5000",
  {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  }
);

export default socket;