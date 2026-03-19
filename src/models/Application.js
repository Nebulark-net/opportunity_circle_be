import mongoose, { Schema } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       required:
 *         - userId
 *         - opportunityId
 *         - status
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         opportunityId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, under_review, accepted, rejected]
 *           default: pending
 *         notes:
 *           type: string
 *         appliedAt:
 *           type: string
 *           format: date-time
 */
const applicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: [true, 'Opportunity ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'SUBMITTED',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only apply to an opportunity once
applicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
