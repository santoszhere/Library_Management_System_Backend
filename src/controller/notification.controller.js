import { ChatEventEnum } from "../config/constants.js";
import { Notification } from "../model/notification_.model.js";
import { emitSocketEvent } from "../socket/socket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const markNotificationAsSeen = asyncHandler(async (req, res) => {
  const { notificationId } = req.body;

  // Find the notification by ID
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  // Mark the notification as seen by adding the user to the 'seenBy' field
  await Notification.findByIdAndUpdate(notificationId, {
    $addToSet: { seenBy: req.user._id },
  });

  emitSocketEvent(
    req,
    notification.recipientId.toString(),
    ChatEventEnum.NEW_NOTIFICATION_EVENT,
    {
      notificationId,
      message: `Notification marked as seen by ${req.user._id}`,
    }
  );

  res.status(200).json(new ApiResponse(200, {}, "Notification marked as seen"));
});

const getUserNotifications = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Retrieve all notifications that the user hasn't seen yet
  const notifications = await Notification.find({
    seenBy: { $ne: userId },
  }).sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notifications,
        "Notifications retrieved successfully"
      )
    );

  // Optionally, emit event after retrieving notifications
  emitSocketEvent(
    req, // Request object
    userId, // Room ID (user ID)
    ChatEventEnum.SEND_NOTIFICATION_EVENT,
    { userId, notifications }
  );
});

const getAllNotification = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, notifications, "All notifications retrieved"));
});

export { markNotificationAsSeen, getUserNotifications, getAllNotification };
