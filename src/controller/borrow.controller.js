import { Book } from "../model/book.model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const borrowBook = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  if (!book.availability) {
    throw new ApiError(400, "Book is currently unavailable");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  console.log(user);
  book.availability = false;
  book.borrowedBy = req.user._id;
  book.borrowedAt = new Date();
  book.dueDate = new Date();
  book.dueDate.setDate(book.borrowedAt.getDate() + 14);
  user.borrowedBooks.push(book._id);
  await user.save();

  const updatedBook = await book.save();

  res
    .status(200)
    .json(new ApiResponse(200, updatedBook, "Book borrowed successfully"));
});

const returnBook = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  if (book.availability) {
    throw new ApiError(400, "Book is already available");
  }
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  book.availability = true;
  book.borrowedBy = null;
  book.borrowedAt = null;
  book.dueDate = null;
  user.borrowedBooks = user.borrowedBooks.filter(
    (id) => id.toString() !== bookId.toString()
  );
  await user.save();
  const updatedBook = await book.save();

  res
    .status(200)
    .json(new ApiResponse(200, updatedBook, "Book returned successfully"));
});
const checkAvailability = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { available: book.availability },
        "Book availability status"
      )
    );
});

export { borrowBook, returnBook, checkAvailability };
