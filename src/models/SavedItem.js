import mongoose, { Schema } from 'mongoose';

const savedItemSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      index: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'Opportunity',
      index: true,
    },
    itemType: {
      type: String,
      enum: ['RESOURCE', 'OPPORTUNITY'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saves
savedItemSchema.index({ userId: 1, resourceId: 1, opportunityId: 1 }, { unique: true });
savedItemSchema.index({ userId: 1, itemType: 1 });

export const SavedItem = mongoose.model('SavedItem', savedItemSchema);
