import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['APPLICATION_UPDATE', 'NEW_OPPORTUNITY', 'DEADLINE_REMINDER', 'SYSTEM', 'RESOURCE'],
      required: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
