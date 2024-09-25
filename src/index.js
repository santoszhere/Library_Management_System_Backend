import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io"; // Import Socket.IO
import { PORT } from "./config/constants.js";
import connectToDb from "./db/connect.js";
import userRouter from "./routes/user.route.js";
import bookRouter from "./routes/book.route.js";
import adminRouter from "./routes/admin.route.js";
import borrowRouter from "./routes/borrow.route.js";
import scheduleReminders from "./utils/scheduleReminder.js";
import notificationRouter from "./routes/notification.route.js";
import searchRouter from "./routes/search.route.js";
import { initializeSocketIO } from "./socket/socket.js";
import chatRouter from "./routes/chat.route.js";
import chatMessageRouter from "./routes/chatmessage.route.js";

const app = express();
connectToDb();

// Middleware setup
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
scheduleReminders();
app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(urlencoded({ extended: true, limit: "20mb" }));
app.use(express.static("public"));

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/search", searchRouter);

// chat Router
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/chat/messages", chatMessageRouter);

const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);
initializeSocketIO(io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendNotification", (data) => {
    io.emit("bookNotification", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
