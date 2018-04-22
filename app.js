// Import packages
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

// Configuration
const port = process.env.PORT || 3000;
const app = express();
app.use(express.static(__dirname + '/public'));

// Start server
const server = app.listen(port, () => console.log('Listening on localhost:' + port));
const io = socketIO(server);

// Register "connection" events to the WebSocket
io.on('connection', function(socket) {
  socket.on('join', function(room) {
    socket.join(room);
    socket.on('image', function(msg) {
      socket.broadcast.to(room).emit('image', msg);
    });
  })
});
