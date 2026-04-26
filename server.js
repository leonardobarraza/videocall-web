const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

io.on('connection', socket => {

    socket.on('join-room', roomId => {
        socket.join(roomId);

        socket.to(roomId).emit('user-connected', socket.id);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });

});

server.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});