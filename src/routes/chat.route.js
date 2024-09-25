import { Router } from "express";
import {
  addNewParticipantInGroupChat,
  createAGroupChat,
  createOrGetAOneOnOneChat,
  deleteGroupChat,
  deleteOneOnOneChat,
  getAllChats,
  getGroupChatDetails,
  leaveGroupChat,
  removeParticipantFromGroupChat,
  renameGroupChat,
  searchAvailableUsers,
} from "../controller/chat.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const chatRouter = Router();

chatRouter.use(verifyJwt);

chatRouter.route("/").get(getAllChats);

chatRouter.route("/users").get(searchAvailableUsers);

chatRouter.route("/c/:receiverId").post(createOrGetAOneOnOneChat);

chatRouter.route("/group").post(createAGroupChat);

chatRouter
  .route("/group/:chatId")
  .get(getGroupChatDetails)
  .patch(renameGroupChat)
  .delete(deleteGroupChat);

chatRouter
  .route("/group/:chatId/:participantId")
  .post(addNewParticipantInGroupChat)
  .delete(removeParticipantFromGroupChat);

chatRouter.route("/leave/group/:chatId").delete(leaveGroupChat);

chatRouter.route("/remove/:chatId").delete(deleteOneOnOneChat);

export default chatRouter;
