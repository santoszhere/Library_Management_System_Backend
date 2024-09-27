import { Book } from "../model/book.model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateCosineSimilarity } from "../utils/calculateCosineSimilarity.js";

const recommendBooksToUser = async (userId) => {
  const users = await User.find({}).populate("borrowedBooks");
  const books = await Book.find({});
  const targetUser = users.find((user) => user._id.toString() === userId);

  if (!targetUser) throw new ApiError(404, "User not found");

  const userBookMatrix = users.map((user) => {
    const borrowedBooksSet = new Set(
      user.borrowedBooks.map((book) => book._id.toString())
    );
    return {
      userId: user._id.toString(),
      ratings: books.map((book) =>
        borrowedBooksSet.has(book._id.toString()) ? 1 : 0
      ),
    };
  });

  const targetUserBooks = userBookMatrix.find(
    (user) => user.userId === userId
  ).ratings;
  const similarities = userBookMatrix.map((otherUser) => ({
    userId: otherUser.userId,
    similarity: calculateCosineSimilarity(targetUserBooks, otherUser.ratings),
  }));

  const similarUsers = similarities
    .filter((item) => item.userId !== userId)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  const recommendedBooks = new Set();
  similarUsers.forEach((simUser) => {
    const similarUser = users.find(
      (user) => user._id.toString() === simUser.userId
    );
    similarUser.borrowedBooks.forEach((book) => {
      if (!targetUser.borrowedBooks.some((b) => b._id.equals(book._id))) {
        recommendedBooks.add(book._id.toString());
      }
    });
  });

  return await Book.find({
    _id: { $in: Array.from(recommendedBooks) },
  }).populate({
    path: "borrowedBy",
    select:
      "-password -refreshToken -borrowedBooks -resetPasswordToken -resetPasswordExpires",
  });
};

const recommendBooksByGenre = async (userId) => {
  const user = await User.findById(userId).populate("borrowedBooks");

  if (!user) throw new ApiError(404, "User not found");

  const allBooks = await Book.find({});
  const genreCount = user.borrowedBooks.reduce((acc, book) => {
    acc[book.genre] = (acc[book.genre] || 0) + 1;
    return acc;
  }, {});

  const favoriteGenres = Object.keys(genreCount).sort(
    (a, b) => genreCount[b] - genreCount[a]
  );
  const recommendedBooks = allBooks.filter(
    (book) =>
      favoriteGenres.includes(book.genre) &&
      !user.borrowedBooks.some((borrowedBook) =>
        borrowedBook._id.equals(book._id)
      )
  );

  return recommendedBooks;
};

export { recommendBooksToUser, recommendBooksByGenre };
