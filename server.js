const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Socket.io lógica de videollamada
io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("join-room", (room) => {
        socket.join(room);

        // Avisar a otros usuarios en la sala
        socket.to(room).emit("user-connected", socket.id);

        // Señalización WebRTC
        socket.on("signal", (data) => {
            socket.to(room).emit("signal", {
                id: socket.id,
                signal: data
            });
        });

        socket.on("disconnect", () => {
            socket.to(room).emit("user-disconnected", socket.id);
        });
    });
});

// 🔥 IMPORTANTE: puerto dinámico para Render
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Servidor en puerto", PORT);
});