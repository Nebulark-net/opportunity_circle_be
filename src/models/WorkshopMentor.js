import mongoose, { Schema } from 'mongoose';

const workshopMentorSchema = new Schema(
  {
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
      index: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate linking
workshopMentorSchema.index({ opportunityId: 1, mentorId: 1 }, { unique: true });

export const WorkshopMentor = mongoose.model('WorkshopMentor', workshopMentorSchema);
