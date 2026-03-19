import mongoose, { Schema } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *         - message
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *           enum: [info, success, warning, error]
 *           default: info
 *         isRead:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 */
const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
