import { Router } from "express";
import {
  getCollaborativeRecommendations,
  getGenreBasedRecommendations,
} from "../controller/recommendation.controller.js";

const recommendRouter = Router();

recommendRouter.get("/collaborative/:userId", getCollaborativeRecommendations);

recommendRouter.get("/genre/:userId", getGenreBasedRecommendations);

export default recommendRouter;
