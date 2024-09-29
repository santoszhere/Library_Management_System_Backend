import { Review } from "../model/review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const postReview = asyncHandler(async(req, res) => {
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
        throw new ApiError(500, "Error creating review");
    }
});

const populateNestedReplies = async(review) => {
    const populatedReview = await Review.findById(review._id)
        .populate({
            path: "userId",
            select: "username avatar"
        })
        .lean();

    if (review.replies && review.replies.length > 0) {
        populatedReview.replies = await Promise.all(
            review.replies.map(async(replyId) => {
                const reply = await Review.findById(replyId).lean();
                return populateNestedReplies(reply);
            })
        );
    }

    return populatedReview;
};
const getReviewsForBook = asyncHandler(async(req, res) => {
    const { bookId } = req.params;

    let reviews = await Review.find({ bookId, parentReviewId: null })
        .populate({
            path: "userId",
            select: "username avatar"
        })
        .lean();

    reviews = await Promise.all(
        reviews.map((review) => populateNestedReplies(review))
    );

    if (!reviews.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No reviews found for this book"));
    }

    res
        .status(200)
        .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});
const editReview = asyncHandler(async(req, res) => {
    const { content, reviewId } = req.body;

    if (!reviewId) throw new ApiError(404, "Review id not found")
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required to edit the review");
    }

    const review = await Review.findOneAndUpdate({ _id: reviewId, userId: req.user._id }, { content }, { new: true });

    if (!review) {
        throw new ApiError(404, "Review not found or user unauthorized");
    }

    res
        .status(200)
        .json(new ApiResponse(200, review, "Review updated successfully"));
});

const deleteReview = asyncHandler(async(req, res) => {
    const { reviewId } = req.body;
    if (!reviewId) throw new ApiError(404, "Review id not found")

    const review = await Review.findOneAndDelete({ _id: reviewId, userId: req.user._id });

    if (!review) {
        throw new ApiError(404, "Review not found or user unauthorized")
    }

    if (review.parentReviewId) {
        await Review.findByIdAndUpdate(review.parentReviewId, {
            $pull: { replies: reviewId }
        });
    }

    await Review.deleteMany({ parentReviewId: review._id });

    res
        .status(200)
        .json(new ApiResponse(200, null, "Review and its replies deleted successfully"));
});

export { postReview, getReviewsForBook, editReview, deleteReview };