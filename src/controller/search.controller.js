import { Book } from "../model/book.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const searchBooks = asyncHandler(async(req, res) => {
    const { title, author, genre, isbn, availability, publicationYear, sortBy } = req.query;
    console.log(req.query)

    let filters = {};

    // Correcting the genre filter to match the model
    if (title) filters.title = { $regex: title, $options: "i" };
    if (author) filters.author = { $regex: author, $options: "i" };
    if (genre) filters.genre = { $regex: genre, $options: "i" }; // Changed from category to genre
    if (isbn) filters.isbn = isbn;
    if (availability !== undefined) filters.availability = availability === 'true';
    if (publicationYear) filters.publicationYear = Number(publicationYear);

    // Sorting logic
    let sortOption = {};
    if (sortBy === 'newest') {
        sortOption.publicationYear = -1; // Newest first
    } else if (sortBy === 'oldest') {
        sortOption.publicationYear = 1; // Oldest first
    } else if (sortBy === 'title') {
        sortOption.title = 1; // Alphabetically by title
    }

    // Query with filters and sorting
    const books = await Book.find(filters)
        .sort(sortOption)
        .populate("borrowedBy"); // Populating borrowedBy with User details

    console.log(books)
        // Returning the response
    res.status(200).json(new ApiResponse(200, books, "Your search results"));
});


const getCategories = asyncHandler(async(req, res) => {
    const book = await Book.distinct("genre")
    res.status(200).json(new ApiResponse(200, book, "Genre details"))

})

export { searchBooks, getCategories };