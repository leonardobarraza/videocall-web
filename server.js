const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔥 FORZAR carpeta pública correctamente
app.use(express.static(path.join(__dirname, "public")));

// 🔥 SI ENTRAN A "/" SIEMPRE CARGA index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// SOCKET IO
io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("join-room", (room) => {
        socket.join(room);

        socket.to(room).emit("user-connected", socket.id);

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

// PORT PARA RENDER
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Servidor en puerto", PORT);
});