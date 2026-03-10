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
}, { _id: false });

const resourceSchema = new Schema(
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
      enum: ['INTERVIEW_PREP', 'RESUME_TEMPLATE', 'CAREER_GUIDE', 'SKILL_WORKSHOP', 'ARTICLE', 'VIDEO'],
      required: true,
      index: true,
    },
    description: {
      type: i18nSchema,
    },
    contentUrl: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    isDownloadable: {
      type: Boolean,
      default: false,
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

// Text index for search functionality
resourceSchema.index({ searchTokens: 'text', 'title.en': 'text', 'description.en': 'text' });

export const Resource = mongoose.model('Resource', resourceSchema);
