import { CmsPage } from '../models/CmsPage.js';
import { ApiError } from '../utils/apiError.js';

const getCmsPage = async (pageKey) => {
  const page = await CmsPage.findOne({ pageKey });
  if (!page) throw new ApiError(404, 'CMS page not found');
  return page;
};

const updateCmsPage = async (pageKey, userId, updateData) => {
  const page = await CmsPage.findOneAndUpdate(
    { pageKey },
    {
      $set: { ...updateData, updatedBy: userId },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return page;
};

const getAllCmsPages = async () => {
  return await CmsPage.find({}).select('pageKey title updatedAt');
};

export {
  getCmsPage,
  updateCmsPage,
  getAllCmsPages,
};
