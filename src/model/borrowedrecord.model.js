const mongoose = require("mongoose");
import { Schema, model } from "mongoose";

const borrowRecordSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  borrowedDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
  dueDate: { type: Date, required: true },
  returned: { type: Boolean, default: false },
});

export const BorrowRecord = model("BorrowRecord", borrowRecordSchema);
