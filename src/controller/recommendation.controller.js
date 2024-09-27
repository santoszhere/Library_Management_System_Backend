import {
  recommendBooksByGenre,
  recommendBooksToUser,
} from "../service/recommendationService.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getCollaborativeRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recommendedBooks = await recommendBooksToUser(userId);
    res
      .status(200)
      .json(new ApiResponse(200, recommendedBooks, "Recommended books"));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGenreBasedRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recommendedBooks = await recommendBooksByGenre(userId);
    res
      .status(200)
      .json(new ApiResponse(200, recommendedBooks, "Recommended books"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server errorr"));
  }
};

export { getCollaborativeRecommendations, getGenreBasedRecommendations };
