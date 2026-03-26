import { ApiResponse } from '../utils/apiResponse.js';
import * as opportunityService from '../services/opportunity.service.js';
import * as analyticsService from '../services/analytics.service.js';
import * as publisherService from '../services/publisher.service.js';
import * as applicationService from '../services/application.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { Opportunity } from '../models/Opportunity.js';
import fs from 'fs';

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getPublisherStats(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Publisher stats fetched successfully'));
});

const getMyOpportunities = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {
    publisherId: req.user._id,
    isDeleted: false,
    // No status filter — publishers see ALL their listings (PENDING, ACTIVE, DRAFT, EXPIRED, etc.)
  };

  const [opportunities, total] = await Promise.all([
    Opportunity.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Opportunity.countDocuments(query),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      opportunities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, 'Publisher opportunities fetched successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  let profileData = { ...req.body };

  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'publisher-profiles');
    profileData.organizationLogo = result.secure_url;
    // For publishers, we also update the user's profilePhotoUrl for consistency in headers
    profileData.profilePhotoUrl = result.secure_url; 
    
    // Remove local temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }

  const profile = await publisherService.updateProfile(req.user._id, profileData);

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

const getAllApplicants = asyncHandler(async (req, res) => {
  const result = await applicationService.getAllPublisherApplications(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'All applicants fetched successfully'));
});

const uploadOpportunityImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided');
  }

  const result = await uploadToCloudinary(req.file.path, 'opportunities');
  
  if (fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { imageUrl: result.secure_url }, 'Opportunity image uploaded successfully'));
});

export {
  getDashboardStats,
  getMyOpportunities,
  updateProfile,
  getMyProfile,
  completeOnboarding,
  getOpportunityApplications,
  updateApplicationStatus,
  getAllApplicants,
  uploadOpportunityImage,
};
