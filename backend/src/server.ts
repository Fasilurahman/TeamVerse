import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io';
import app from "./app";
import { initSocket } from './infrastructure/services/socketService';



const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});
const socketService = initSocket(io);
app.set('io', io);
app.set('socketService', socketService);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
