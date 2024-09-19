import { Book } from "../model/book.model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const changeUserRoles = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (role === "member") {
    user.role = "librarian";
  } else if (role === "librarian") {
    user.role = "member";
  }
  const updatedUser = await user.save();
  res.status(200).json(new ApiResponse(200, updatedUser, "User updated "));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select(
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
export { changeUserRoles, deleteUser, getStatistics, getAllUsers };
