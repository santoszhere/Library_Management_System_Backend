import { Review } from "../model/review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const postReview = asyncHandler(async (req, res) => {
  const { bookId, content, parentReviewId } = req.body;

  if (![bookId, content].every((field) => field && field !== "")) {
    throw new ApiError(400, "Book ID, user ID, and content are required");
  }

  try {
    const reviewData = { bookId, userId: req.user._id, content };
    if (parentReviewId) {
      reviewData.parentReviewId = parentReviewId;
    }

    const review = await Review.create(reviewData);

    if (review) {
      if (parentReviewId) {
        const parentReview = await Review.findById(parentReviewId);
        if (!parentReview) {
          throw new ApiError(404, "Parent review not found");
        }
        parentReview.replies.push(review._id);
        await parentReview.save();
      }

      res
        .status(200)
        .json(new ApiResponse(200, review, "Review added successfully"));
    }
  } catch (error) {
    next(new ApiError(500, "Error creating review"));
  }
});

const getReviewsForBook = asyncHandler(async (req, res, next) => {
  const { bookId } = req.params;

  const reviews = await Review.find({ bookId, parentReviewId: null }).populate({
    path: "replies",
    populate: { path: "replies", populate: { path: "replies" } },
  });

  if (!reviews.length) {
    return res
      .status(404)
      .json(new ApiError(404, "No reviews found for this book"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

export { postReview, getReviewsForBook };
