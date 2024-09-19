import { Router } from "express";
import { authorizeRoles, verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addBook,
  deleteBook,
  getAllBooks,
  getSingleBook,
  updateBookDetail,
} from "../controller/book.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const bookRouter = Router();

bookRouter
  .route("/add-book")
  .post(
    upload.single("avatar"),
    verifyJwt,
    authorizeRoles("librarian", "admin"),
    addBook
  );

bookRouter.route("/get-all-books").get(getAllBooks);
bookRouter.route("/get-single-book/:bookId").get(getSingleBook);
bookRouter
  .route("/update-book/:bookId")
  .patch(authorizeRoles("librarian", "admin"), updateBookDetail);
bookRouter
  .route("/delete-book/:bookId")
  .delete(authorizeRoles("librarian", "admin"), deleteBook);

export default bookRouter;
