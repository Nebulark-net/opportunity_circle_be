import mongoose, { Schema } from 'mongoose';

const mentorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String, // Cloudinary URL
    },
    designation: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Mentor = mongoose.model('Mentor', mentorSchema);
