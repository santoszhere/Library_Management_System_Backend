import { Router } from "express";
import { authorizeRoles, verifyJwt } from "../middlewares/auth.middleware.js";
import {
  borrowBook,
  checkAvailability,
  returnBook,
} from "../controller/borrow.controller.js";

const borrowRouter = Router();
borrowRouter.use(verifyJwt);
borrowRouter
  .route("/books/:bookId/borrow")
  .post(authorizeRoles("member"), borrowBook);
borrowRouter
  .route("/books/:bookId/return")
  .post(authorizeRoles("member"), returnBook);
borrowRouter.route("/books/:bookId/availability").get(checkAvailability);

export default borrowRouter;
