import mongoose, { Schema } from 'mongoose';

const seekerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const SeekerProfile = mongoose.model('SeekerProfile', seekerProfileSchema);
