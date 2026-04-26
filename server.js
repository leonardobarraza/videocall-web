const express = require('express');
const app = express();
const server = require('http').createServer(app);

// 🔥 SOCKET.IO SIN CORS ERROR
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🔥 PEER SERVER
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer);
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

io.on('connection', socket => {

  socket.on('join-room', ({ roomId, peerId }) => {

    socket.join(roomId);

    socket.to(roomId).emit('user-connected', peerId);

    socket.on('message', msg => {
      io.to(roomId).emit('createMessage', msg);
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', peerId);
    });
  });

});

server.listen(PORT, () => console.log("Servidor corriendo en " + PORT));