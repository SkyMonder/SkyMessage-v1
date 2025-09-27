const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use('/api/auth', authRoutes);

io.on('connection', (socket) => {
  console.log('New WS connection');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));