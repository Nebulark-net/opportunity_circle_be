import mongoose, { Schema } from 'mongoose';

const applicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN'],
      default: 'SUBMITTED',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    withdrawnAt: {
      type: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
    },
    answers: [
      {
        questionId: {
          type: String,
          required: true,
        },
        response: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ opportunityId: 1, userId: 1 }, { unique: true });
applicationSchema.index({ userId: 1, status: 1 });

export const Application = mongoose.model('Application', applicationSchema);
