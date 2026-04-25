const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", socket => {
    console.log("Usuario conectado:", socket.id);

    // 🔥 PEGA AQUÍ
    socket.on("join-room", room => {
        socket.join(room);

        socket.to(room).emit("user-connected", socket.id);

        socket.on("signal", data => {
            socket.to(room).emit("signal", data);
        });

        socket.on("disconnect", () => {
            socket.to(room).emit("user-disconnected", socket.id);
        });
    });
});

http.listen(4000, () => {
    console.log("Servidor en http://localhost:4000");
});