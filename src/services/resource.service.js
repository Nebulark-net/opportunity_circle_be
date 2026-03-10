import { Resource } from '../models/Resource.js';
import { SavedItem } from '../models/SavedItem.js';
import { ApiError } from '../utils/apiError.js';

const createResource = async (publisherId, resourceData) => {
  const searchTokens = [
    ...resourceData.title.en.toLowerCase().split(/\s+/),
    ...(resourceData.tags || []),
  ];

  return await Resource.create({
    ...resourceData,
    publisherId,
    searchTokens,
  });
};

const getAllResources = async (filters = {}, options = {}) => {
  const { type, search } = filters;
  const { page = 1, limit = 10 } = options;

  const query = { isDeleted: false };

  if (type) query.type = type;
  if (search) {
    query.$text = { $search: search };
  }

  const resources = await Resource.find(query)
    .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Resource.countDocuments(query);

  return { resources, total, page, totalPages: Math.ceil(total / limit) };
};

const getResourceById = async (id) => {
  const resource = await Resource.findOne({ _id: id, isDeleted: false })
    .populate('publisherId', 'fullName organizationName');

  if (!resource) throw new ApiError(404, 'Resource not found');

  // Track view Count
  resource.viewCount += 1;
  await resource.save();

  return resource;
};

const updateResource = async (id, publisherId, updateData) => {
  const resource = await Resource.findOne({ _id: id, publisherId });
  if (!resource) throw new ApiError(404, 'Resource not found or unauthorized');

  if (updateData.title || updateData.tags) {
    const title = updateData.title?.en || resource.title.en;
    const tags = updateData.tags || resource.tags;
    updateData.searchTokens = [
      ...title.toLowerCase().split(/\s+/),
      ...(tags || []),
    ];
  }

  return await Resource.findByIdAndUpdate(id, { $set: updateData }, { new: true });
};

const deleteResource = async (id, publisherId) => {
  const resource = await Resource.findOneAndUpdate(
    { _id: id, publisherId },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );

  if (!resource) throw new ApiError(404, 'Resource not found or unauthorized');

  return resource;
};

const toggleSaveItem = async (userId, itemId, itemType) => {
  const query = { userId, itemType };
  if (itemType === 'OPPORTUNITY') {
    query.opportunityId = itemId;
  } else {
    query.resourceId = itemId;
  }

  const existingSave = await SavedItem.findOne(query);

  if (existingSave) {
    await SavedItem.findByIdAndDelete(existingSave._id);
    return { saved: false };
  }

  await SavedItem.create(query);
  return { saved: true };
};

const getSavedItems = async (userId, itemType) => {
  const query = { userId };
  if (itemType) query.itemType = itemType;

  return await SavedItem.find(query)
    .sort({ createdAt: -1 })
    .populate('resourceId')
    .populate('opportunityId');
};

export {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  toggleSaveItem,
  getSavedItems,
};
