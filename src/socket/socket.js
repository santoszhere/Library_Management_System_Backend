import cookie from "cookie";
import jwt from "jsonwebtoken";
import { ChatEventEnum } from "../config/constants.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { Notification } from "../model/notification_.model.js";

const verifySocketToken = async (socket) => {
  const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
  let token = cookies?.accessToken || socket.handshake.auth?.token;

  if (!token)
    throw new ApiError(401, "Unauthorized handshake. Token is missing");

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!user)
    throw new ApiError(401, "Unauthorized handshake. Token is invalid");

  return user;
};

const mountSocketEvents = (socket, io) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log(`User joined chat: ${chatId}`);
    socket.join(chatId);
  });

  socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
    socket.to(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });

  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    socket.to(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });

  socket.on(ChatEventEnum.SEND_NOTIFICATION_EVENT, async (notificationData) => {
    const { recipientId, message, bookId } = notificationData;
    const notification = new Notification({ message, bookId, seenBy: [] });

    try {
      await notification.save();
      io.to(recipientId).emit(
        ChatEventEnum.NEW_NOTIFICATION_EVENT,
        notification
      );
      console.log(`Notification sent to ${recipientId}:`, notification);
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  });

  socket.on(ChatEventEnum.BOOK_NOTIFICATION_EVENT, (data) => {
    io.emit(ChatEventEnum.BOOK_NOTIFICATION_EVENT, data);
  });

  socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
    console.log(`User disconnected: ${socket.user?._id}`);
    socket.leave(socket.user?._id);
  });
};

const initializeSocketIO = (io) => {
  io.on("connection", async (socket) => {
    try {
      const user = await verifySocketToken(socket);
      socket.user = user;
      socket.join(user._id.toString());

      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      console.log(`User connected: ${user._id}`);

      mountSocketEvents(socket, io);
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Connection error."
      );
    }
  });
};

const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").to(roomId).emit(event, payload);
};

export { initializeSocketIO, emitSocketEvent };
