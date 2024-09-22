import { Notification } from "../model/notification_.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const markNotificationAsSeen = asyncHandler(async(req, res) => {
    const { notificationId } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    await Notification.findByIdAndUpdate(notificationId, {
        $addToSet: { seenBy: req.user._id }
    });

    res.status(200).json(new ApiResponse(200, {}, "Notification marked as seen"));
});

const getUserNotifications = asyncHandler(async(req, res) => {
    const { userId } = req.params;

    const notifications = await Notification.find({
        seenBy: { $ne: userId }
    }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, notifications, "Notifications retrieved successfully"));
});

const getAllNotification = asyncHandler(async(req, res) => {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, notifications, "All notifications"))
})
export {
    markNotificationAsSeen,
    getUserNotifications,
    getAllNotification
}