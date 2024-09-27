import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getReviewsForBook,
  postReview,
} from "../controller/review.controller.js";

const reviewRouter = Router();
reviewRouter.use(verifyJwt);
reviewRouter.route("/add-review").post(postReview);
reviewRouter.route("/get-review/:bookId").get(getReviewsForBook);

export default reviewRouter;
