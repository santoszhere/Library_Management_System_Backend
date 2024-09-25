import { Router } from "express";

import {
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../controller/chatmessage.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const chatMessageRouter = Router();

chatMessageRouter.use(verifyJwt);
chatMessageRouter.route("/:chatId").get(getAllMessages).post(sendMessage);
chatMessageRouter.route("/:chatId/:messageId").delete(deleteMessage);

export default chatMessageRouter;
