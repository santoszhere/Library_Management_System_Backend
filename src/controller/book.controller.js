import { isObjectIdOrHexString } from "mongoose";
import { Book } from "../model/book.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Notification } from "../model/notification_.model.js";
import { emitSocketEvent } from "../socket/socket.js";
import { ChatEventEnum } from "../config/constants.js";

const addBook = asyncHandler(async (req, res) => {
  const { title, author, genre, publicationYear, isbn, description } = req.body;

  if (
    [title, author, genre, publicationYear, isbn, description].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const bookImageAvatar = req.file?.path;
  if (!bookImageAvatar) {
    throw new ApiError(400, "Book avatar not found");
  }

  const bookAvatar = await uploadOnCloudinary(bookImageAvatar);
  if (!bookAvatar) throw new ApiError(400, "Failed to upload the image");

  const book = await Book.create({
    title,
    author,
    genre,
    publicationYear,
    isbn,
    description,
    coverImage: bookAvatar.url,
  });

  if (!book) throw new ApiError(400, "Failed to add a book");

  const notificationMessage = `Author ${author.toLowerCase()} added a new book: '${title}'`;

  await Notification.create({
    message: notificationMessage,
    bookId: book._id,
    seenBy: req.user._id,
  });
  emitSocketEvent(req, book._id, ChatEventEnum.BOOK_NOTIFICATION_EVENT, book);

  io.emit("bookNotification", {
    message: notificationMessage,
  });

  res.status(200).json(new ApiResponse(200, book, "Book added successfully"));
});

const getAllBooks = asyncHandler(async (req, res) => {
  const book = await Book.find().populate("borrowedBy");
  if (!book) throw new ApiError(404, "Books not found");
  res.status(200).json(new ApiResponse(200, book, "Book details"));
});

const getSingleBook = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const book = await Book.findById(bookId).populate({
    path: "borrowedBy",
    select:
      "-password -borrowedBooks -resetPasswordToken -resetPasswordExpires",
  });

  if (!book) throw new ApiError(404, "Book not found");
  res.status(200).json(new ApiResponse(200, book, "Single book detail"));
});
const updateBookDetail = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { title, author, genre, publicationYear } = req.body;
  const existingBook = await Book.findById(bookId);
  if (!existingBook) throw new ApiError(404, "Book not found");

  const updateBook = await Book.findByIdAndUpdate(
    bookId,
    { $set: { title, author, genre, publicationYear } },
    { new: true }
  );

  if (!updateBook) throw new ApiError(400, "Failed to update the book");
  res
    .status(200)
    .json(new ApiResponse(200, updateBook, "Book details update successfully"));
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) throw new ApiError(404, "Book not found");
  const notificationMessage = `The book "${book.title}" has been deleted.`;
  const notification = new Notification({
    message: notificationMessage,
    bookId: book._id,
  });

  await notification.save();

  io.emit("bookNotification", {
    message: notificationMessage,
  });

  await Book.findByIdAndDelete(req.params.bookId);
  res.status(200).json(new ApiResponse(200, {}, "Book deleted successfully"));
});
export { addBook, getAllBooks, getSingleBook, updateBookDetail, deleteBook };
