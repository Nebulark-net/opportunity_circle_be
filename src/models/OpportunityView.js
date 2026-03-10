import mongoose, { Schema } from 'mongoose';

const opportunityViewSchema = new Schema(
  {
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    viewerIp: {
      type: String,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const OpportunityView = mongoose.model('OpportunityView', opportunityViewSchema);
