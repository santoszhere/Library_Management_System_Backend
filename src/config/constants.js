import { config } from "dotenv";
config();
export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
export const DB_NAME = "LMS";
export const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};

export const ChatEventEnum = Object.freeze({
    CONNECTED_EVENT: "connected",
    DISCONNECT_EVENT: "disconnect",
    JOIN_CHAT_EVENT: "joinChat",
    LEAVE_CHAT_EVENT: "leaveChat",
    UPDATE_GROUP_NAME_EVENT: "updateGroupName",
    MESSAGE_RECEIVED_EVENT: "messageReceived",
    NEW_CHAT_EVENT: "newChat",
    SOCKET_ERROR_EVENT: "socketError",
    STOP_TYPING_EVENT: "stopTyping",
    TYPING_EVENT: "typing",
    MESSAGE_DELETE_EVENT: "messageDeleted",
    SEND_NOTIFICATION_EVENT: "sendNotification",
    BOOK_NOTIFICATION_EVENT: "bookNotification",
});

export const AvailableChatEvents = Object.values(ChatEventEnum);