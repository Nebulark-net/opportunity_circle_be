import { ApiResponse } from '../utils/apiResponse.js';
import * as opportunityService from '../services/opportunity.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Get all pending opportunities for moderation
 * GET /api/admin/moderation-queue
 */
const getModerationQueue = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await opportunityService.getAllOpportunities(
    { status: 'PENDING' },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Moderation queue fetched successfully'));
});

/**
 * Approve or reject an opportunity
 * PATCH /api/admin/opportunities/:id/status
 */
const updateOpportunityStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['ACTIVE', 'REJECTED'].includes(status)) {
    throw new ApiError(400, 'Invalid status for moderation. Use ACTIVE or REJECTED.');
  }

  const opportunity = await opportunityService.updateOpportunityStatus(id, status);

  // TODO: Send notification to publisher with reason if rejected

  return res
    .status(200)
    .json(new ApiResponse(200, opportunity, `Opportunity ${status === 'ACTIVE' ? 'approved' : 'rejected'} successfully`));
});

export {
  getModerationQueue,
  updateOpportunityStatus,
};
