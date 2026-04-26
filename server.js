const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ⚠️ CSP FIX (evita errores de seguridad)
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; connect-src * ws: wss:; media-src * blob:; script-src 'self' 'unsafe-inline';"
    );
    next();
});

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", socket.id);
    });

    socket.on("signal", ({ roomId, data }) => {
        socket.to(roomId).emit("signal", data);
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log("Servidor en puerto", PORT);
});