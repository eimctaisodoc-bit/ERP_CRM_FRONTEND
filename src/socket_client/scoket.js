// socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.DEV
  ? import.meta.env.VITE_SOCKET_URL_DEV || "http://localhost:5000"
  : import.meta.env.VITE_SOCKET_URL_PROD;

export const allowedPaths = ["/admin/report", "/staff/report", "/client/report"];

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // important
});

// optional: attach listeners once
socket.on("connect", () => {
  // console.log("✅ Connected! ID:", socket);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket Error:", err.message);
});

export default socket;