import { Notification } from '../models/Notification.js';
import { Opportunity } from '../models/Opportunity.js';
import { User } from '../models/User.js';
import { sendEmail } from '../config/email.js';
import { app } from '../app.js';
import logger from '../utils/logger.js';

const createNotification = async ({ userId, title, content, sourceType, sourceId }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      content,
      sourceType,
      sourceId,
    });

    // Send real-time notification via Socket.io
    const io = app.get('io');
    if (io) {
      io.to(userId.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
  }
};

const sendApplicationNotification = async (application, opportunityId) => {
  const opportunity = await Opportunity.findById(opportunityId).populate('publisherId');
  const seeker = await User.findById(application.userId);

  if (!opportunity || !opportunity.publisherId) return;

  const title = 'New Application Received';
  const content = `You have received a new application for "${opportunity.title.en}" from ${seeker.fullName}.`;

  await createNotification({
    userId: opportunity.publisherId._id,
    title,
    content,
    sourceType: 'APPLICATION_UPDATE',
    sourceId: application._id,
  });

  await sendEmail({
    to: opportunity.publisherId.email,
    subject: title,
    template: 'application-received',
    context: {
      publisherName: opportunity.publisherId.fullName,
      opportunityTitle: opportunity.title.en,
      seekerName: seeker.fullName,
      applicationId: application._id,
    },
  });
};

const getMyNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
};

const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true }
  );
};

export {
  createNotification,
  sendApplicationNotification,
  getMyNotifications,
  markAsRead,
};
