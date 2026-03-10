import { ApiResponse } from '../utils/apiResponse.js';
import * as opportunityService from '../services/opportunity.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

const getAllOpportunities = asyncHandler(async (req, res) => {
  const { type, location, search, page, limit, educationLevel, fundingType, status } = req.query;
  
  // Default to ACTIVE unless specified (and user is authorized for other statuses)
  let requestedStatus = 'ACTIVE';
  if (status && (req.user?.role === 'ADMIN' || req.user?.role === 'PUBLISHER')) {
    requestedStatus = status;
  }

  const result = await opportunityService.getAllOpportunities(
    { type, location, search, educationLevel, fundingType, status: requestedStatus },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 10 }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Opportunities fetched successfully'));
});

const getOpportunityById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const ip = req.ip;

  const opportunity = await opportunityService.getOpportunityById(id, userId, ip);

  return res
    .status(200)
    .json(new ApiResponse(200, opportunity, 'Opportunity fetched successfully'));
});

const createOpportunity = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PUBLISHER' && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Only publishers can create opportunities');
  }

  const opportunity = await opportunityService.createOpportunity(req.user._id, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, opportunity, 'Opportunity created successfully'));
});

const updateOpportunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const opportunity = await opportunityService.updateOpportunity(id, req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, opportunity, 'Opportunity updated successfully'));
});

const deleteOpportunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await opportunityService.deleteOpportunity(id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Opportunity deleted successfully'));
});

const updateOpportunityStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Only admins can update opportunity status');
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'ARCHIVED'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const opportunity = await opportunityService.updateOpportunityStatus(id, status);

  return res
    .status(200)
    .json(new ApiResponse(200, opportunity, `Opportunity status updated to ${status}`));
});

export {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStatus,
};
