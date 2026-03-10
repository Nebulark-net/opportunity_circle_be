import { ApiResponse } from '../utils/apiResponse.js';
import * as resourceService from '../services/resource.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const createResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.createResource(req.user._id, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, resource, 'Resource created successfully'));
});

const getAllResources = asyncHandler(async (req, res) => {
  const { type, search, page, limit } = req.query;
  const result = await resourceService.getAllResources(
    { type, search },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 10 }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Resources fetched successfully'));
});

const getResourceById = asyncHandler(async (req, res) => {
  const resource = await resourceService.getResourceById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, resource, 'Resource fetched successfully'));
});

const updateResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resource = await resourceService.updateResource(id, req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, resource, 'Resource updated successfully'));
});

const deleteResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await resourceService.deleteResource(id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Resource deleted successfully'));
});

export {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
};
