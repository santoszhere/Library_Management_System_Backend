import { Book } from "../model/book.model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const changeUserRoles = asyncHandler(async(req, res) => {
    const { role } = req.body;
    const { userId } = req.params;

    if (!["member", "librarian"].includes(role)) {
        throw new ApiError(400, "Invalid role provided");
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.role = role;

    const updatedUser = await user.save();
    if (!updatedUser) throw new ApiError(400, "Failed to update user role");

    res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User role updated successfully"));
});

const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select(
        "-password -refreshToken -resetPasswordToken -resetPasswordExpires"
    );
    res.status(200).json(new ApiResponse(200, users, "User details"));
});
const deleteUser = asyncHandler(async(req, res) => {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});
const getStatistics = asyncHandler(async(req, res) => {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const borrowedBooks = await Book.countDocuments({ availability: false });

    res.status(200).json(
        new ApiResponse(
            200, {
                totalUsers,
                totalBooks,
                borrowedBooks,
            },
            "System statistics"
        )
    );
});
const sendDueDateReminders = asyncHandler(async(req, res) => {
    const { dueDate } = req.body;

    // Find all books that are due on the provided date
    const books = await Book.find({ dueDate });

    if (!books.length) {
        return res.status(404).json(new ApiResponse(404, {}, "No books due on this date"));
    }

    // Loop through the books and send reminder emails to users who borrowed them
    for (const book of books) {
        // Assuming 'borrowedBy' references the user who borrowed the book
        const user = await User.findById(book.borrowedBy);

        if (user) {
            // Send a reminder email to each user
            await sendReminderEmail({
                email: user.email,
                bookTitle: book.title,
                dueDate: dueDate.toDateString(), // Format the due date if necessary
            });
        }
    }

    // Respond to client after sending all emails
    res.status(200).json(new ApiResponse(200, {}, "Reminder emails sent successfully to all users with books due"));
});
export { changeUserRoles, deleteUser, getStatistics, getAllUsers };