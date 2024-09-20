import { Book } from "../model/book.model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { startOfDay, addDays, format } from "date-fns";
import sendReminderEmail from "../utils/mailer.js";

const changeUserRoles = asyncHandler(async (req, res) => {
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

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .populate({
      path: "borrowedBooks",
      select: "-password ",
    })
    .select(
      "-password -refreshToken -resetPasswordToken -resetPasswordExpires"
    );
  res.status(200).json(new ApiResponse(200, users, "User details"));
});
const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.userId);
  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});
const getStatistics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalBooks = await Book.countDocuments();
  const borrowedBooks = await Book.countDocuments({ availability: false });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalBooks,
        borrowedBooks,
      },
      "System statistics"
    )
  );
});
const checkDueDatesAndSendReminders = asyncHandler(async (req, res) => {
  const reminderDate = startOfDay(addDays(new Date(), 2));

  console.log(reminderDate);
  const booksDueSoon = await Book.find({
    dueDate: {
      $gte: reminderDate,
      $lt: addDays(reminderDate, 1),
    },
  });
  console.log(booksDueSoon);

  if (!booksDueSoon.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No books due in 2 days."));
  }

  for (const book of booksDueSoon) {
    const user = await User.findById(book.borrowedBy);

    if (user) {
      await sendReminderEmail({
        email: user.email,
        bookTitle: book.title,
        dueDate: format(book.dueDate, "yyyy-MM-dd"),
      });
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Reminder emails sent successfully."));
});

export {
  changeUserRoles,
  deleteUser,
  getStatistics,
  getAllUsers,
  checkDueDatesAndSendReminders,
};
