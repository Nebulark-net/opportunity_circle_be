import { ApiResponse } from '../utils/apiResponse.js';
import * as notificationService from '../services/notification.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getMyNotifications(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, notifications, 'Notifications fetched successfully'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationService.markAsRead(id, req.user._id);

  if (!notification) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, 'Notification not found'));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notification, 'Notification marked as read'));
});

export {
  getMyNotifications,
  markAsRead,
};
