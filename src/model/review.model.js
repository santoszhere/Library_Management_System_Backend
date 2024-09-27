import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parentReviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },
    replies: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

export const Review = model("Review", reviewSchema);
