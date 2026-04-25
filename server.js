const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("join-room", (room) => {
        socket.join(room);
        socket.to(room).emit("user-connected");
    });

    socket.on("signal", ({ room, data }) => {
        socket.to(room).emit("signal", data);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log("Servidor en http://localhost:" + PORT);
});