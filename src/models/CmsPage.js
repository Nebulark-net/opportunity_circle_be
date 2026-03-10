import mongoose, { Schema } from 'mongoose';

const i18nSchema = new Schema({
  en: {
    type: String,
    trim: true,
  },
  fr: {
    type: String,
    trim: true,
  },
}, { _id: false });

const cmsPageSchema = new Schema(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: i18nSchema,
    },
    mainHeading: {
      type: i18nSchema,
    },
    heroImageUrl: {
      type: String, // Cloudinary URL
    },
    metaData: {
      type: Schema.Types.Mixed,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const CmsPage = mongoose.model('CmsPage', cmsPageSchema);
