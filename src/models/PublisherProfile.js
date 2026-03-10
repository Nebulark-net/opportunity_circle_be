import mongoose, { Schema } from 'mongoose';

const publisherProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    organizationLogo: {
      type: String, // Cloudinary URL
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: ['PENDING', 'TRUSTED'],
      default: 'PENDING',
      index: true,
    },
    approvedListingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const PublisherProfile = mongoose.model('PublisherProfile', publisherProfileSchema);
