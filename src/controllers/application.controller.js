import { ApiResponse } from '../utils/apiResponse.js';
import * as applicationService from '../services/application.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Submit an application for an opportunity
 * POST /api/v1/applications
 */
const submitApplication = asyncHandler(async (req, res) => {
  const { opportunityId, notes } = req.body;
  const userId = req.user?._id;

  if (!opportunityId) {
    throw new ApiError(400, 'Opportunity ID is required');
  }

  const application = await applicationService.submitApplication(
    userId,
    opportunityId,
    { notes }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, application, 'Application submitted successfully'));
});

/**
 * Get the current user's applications
 * GET /api/v1/applications/my
 */
const getMyApplications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const result = await applicationService.getSeekerApplications(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Applications fetched successfully'));
});

/**
 * Get applications for a specific opportunity (Publisher/Admin only)
 * GET /api/v1/applications/opportunity/:opportunityId
 */
const getOpportunityApplications = asyncHandler(async (req, res) => {
  const { opportunityId } = req.params;
  const userId = req.user?._id;

  const result = await applicationService.getOpportunityApplications(opportunityId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Applications for opportunity fetched successfully'));
});

/**
 * Update application status (Publisher/Admin only)
 * PATCH /api/v1/applications/:id/status
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const userId = req.user?._id;

  if (!['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const application = await applicationService.updateApplicationStatus(
    id,
    userId,
    status,
    notes
  );

  return res
    .status(200)
    .json(new ApiResponse(200, application, `Application status updated to ${status}`));
});

export {
  submitApplication,
  getMyApplications,
  getOpportunityApplications,
  updateApplicationStatus,
};
