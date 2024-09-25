import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    message: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export const Notification = model("Notification", notificationSchema);
