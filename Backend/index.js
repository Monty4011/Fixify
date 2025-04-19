import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http"
import { Server } from "socket.io"
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.routes.js"
import workerRoute from "./routes/worker.route.js"
import chatRoute from "./routes/chat.routes.js"

dotenv.config({});
const app = express();
const server = http.createServer(app); // HTTP server for Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.ORIGIN, // Frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('socketio', io);

// Socket.io events
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room based on user ID or worker ID
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`${userId} joined room`);
    });

    // Handle message event
    socket.on('message', (data) => {
        const { senderId, receiverId, message } = data;
        io.to(receiverId).emit('message', { senderId, message, timestamp: new Date() });
        io.to(senderId).emit('message', { senderId, message, timestamp: new Date() }); // Echo back to sender
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "I am coming from backend",
        success: true
    });
});


const corsOptions = {
    origin: process.env.ORIGIN,
    credentials: true
}
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

// api
app.use("/api/v1/user", userRoute);
app.use("/api/v1/worker", workerRoute);
app.use("/api/v1/chat", chatRoute);

server.listen(PORT, () => {
    connectDB();
    console.log(`Server running at port ${PORT}`);
})