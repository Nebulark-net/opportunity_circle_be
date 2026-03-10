import { ApiResponse } from '../utils/apiResponse.js';
import * as opportunityService from '../services/opportunity.service.js';
import * as analyticsService from '../services/analytics.service.js';
import * as publisherService from '../services/publisher.service.js';
import * as applicationService from '../services/application.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getPublisherStats(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Publisher stats fetched successfully'));
});

const getMyOpportunities = asyncHandler(async (req, res) => {
  const result = await opportunityService.getAllOpportunities(
    { publisherId: req.user._id, isDeleted: false },
    { page: req.query.page, limit: req.query.limit }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Publisher opportunities fetched successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await publisherService.updateProfile(req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, profile, 'Profile updated successfully'));
});

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await publisherService.getProfile(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, profile, 'Profile fetched successfully'));
});

const completeOnboarding = asyncHandler(async (req, res) => {
  const result = await publisherService.completeOnboarding(req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Onboarding completed successfully'));
});

const getOpportunityApplications = asyncHandler(async (req, res) => {
  const { opportunityId } = req.params;
  const applications = await applicationService.getOpportunityApplications(opportunityId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, applications, 'Applications fetched successfully'));
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status, notes } = req.body;
  const result = await applicationService.updateApplicationStatus(applicationId, req.user._id, status, notes);

  return res
    .status(200)
    .json(new ApiResponse(200, result, `Application status updated to ${status}`));
});

export {
  getDashboardStats,
  getMyOpportunities,
  updateProfile,
  getMyProfile,
  completeOnboarding,
  getOpportunityApplications,
  updateApplicationStatus,
};
