import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
    if (!token) throw new ApiError(404, "Token not found");
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) throw new ApiError(401, "Unauthorized user");
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, "Authentication error: " + error);
  }
});

export const authorizeRoles = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    try {
      const user = req?.user; // Ensure user is present in the request (from authentication middleware)
      if (!user) throw new ApiError(401, "Unauthorized user");
      console.log(roles);
      console.log(user.role);
      console.log(roles.includes(user.role));
      if (!roles.includes(user?.role)) {
        throw new ApiError(
          403,
          `User is not authorized. Required role(s): ${roles}`
        );
      }

      next();
    } catch (error) {
      throw new ApiError(403, `Authorization error: ${error.message}`);
    }
  });
};
