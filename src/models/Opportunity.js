import mongoose, { Schema } from 'mongoose';

const i18nSchema = new Schema({
  en: {
    type: String,
    required: [true, 'English content is mandatory'],
    trim: true,
  },
  fr: {
    type: String,
    trim: true,
  },
  // Extendable for more languages
}, { _id: false });

const opportunitySchema = new Schema(
  {
    publisherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: i18nSchema,
      required: true,
    },
    type: {
      type: String,
      enum: ['INTERNSHIP', 'SCHOLARSHIP', 'FELLOWSHIP', 'EVENT', 'WORKSHOP'],
      required: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: i18nSchema,
      required: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    educationLevel: {
      type: String,
      enum: ['UNDERGRADUATE', 'GRADUATE', 'PHD', 'ANY'],
      default: 'ANY',
      index: true,
    },
    fundingType: {
      type: String,
      enum: ['FULLY_FUNDED', 'NON_FUNDED', 'PARTIALLY_FUNDED', 'N/A'],
      default: 'N/A',
      index: true,
    },
    specificRequirements: {
      type: i18nSchema,
    },
    deadline: {
      type: Date,
      required: true,
      index: true,
    },
    applyUrl: {
      type: String,
    },
    imageUrl: {
      type: String, // Cloudinary URL
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'ARCHIVED', 'REJECTED'],
      default: 'DRAFT',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    searchTokens: [
      {
        type: String,
        trim: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient searching
opportunitySchema.index({ type: 1, location: 1, status: 1 });
opportunitySchema.index({ organizationName: 1, status: 1 });

// Text index for search functionality
opportunitySchema.index({ searchTokens: 'text', 'title.en': 'text', 'description.en': 'text' });

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
