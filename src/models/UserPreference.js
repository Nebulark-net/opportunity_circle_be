import mongoose, { Schema } from 'mongoose';

const userPreferenceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    interestedTypes: [
      {
        type: String,
        enum: ['INTERNSHIP', 'SCHOLARSHIP', 'FELLOWSHIP', 'EVENT', 'WORKSHOP'],
      },
    ],
    targetLocations: [
      {
        type: String,
        trim: true,
      },
    ],
    fieldOfStudy: {
      type: String,
      trim: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    weeklyDigest: {
      type: Boolean,
      default: true,
    },
    employeeType: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);
