import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Railway fournit souvent PORT via variable d'environnement
const PORT = process.env.PORT || 8080;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Socket.IO server OK");
});

io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);

  socket.emit("response", {
    status: "connected",
    message: "Bienvenue sur le serveur"
  });

  socket.on("command", (message) => {
    console.log("Commande reçue:", message);

    // Réponse de test
    socket.emit("response", {
      status: "ok",
      echo: message
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("Client déconnecté:", socket.id, reason);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});