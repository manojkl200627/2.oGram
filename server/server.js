import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/DBconnect.js";
import userRoute from "./routes/UserRoute.js";
import messRoute from "./routes/MessRoute.js";
import http from "http";
import path from "path";
import { Server } from "socket.io";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "https://datechatweb2-o.onrender.com",
      "http://localhost:3000",
      "http://localhost:5200",
    ],
    credentials: true,
  })
);


connectDB();

app.use("/api/users", userRoute);
app.use("/api/mes", messRoute);

app.get("/", (req, res) => {
  res.send("<h1>Chat Server Running</h1>");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:4200",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});



global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  
  socket.on("add-user", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });

  
  socket.on("send-msg", (data) => {
    console.log("Message from:", data.from, "to:", data.to);

    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("msg-receive", {
        message: data.message,
        from: data.from,
        fromSelf: false,
      });
      console.log(`Sent to recipient ${data.to} (${sendUserSocket})`);
    }

    
    socket.emit("msg-receive", {
      message: data.message,
      from: data.from,
      fromSelf: true,
    });
    console.log(` Echoed back to sender ${data.from} (${socket.id})`);
  });

  
  socket.on("disconnect", () => {
    console.log(" Client disconnected:", socket.id);
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`Removed user ${userId} from online users`);
        break;
      }
    }
  });
});


server.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
