import { Application } from '../models/Application.js';
import { Opportunity } from '../models/Opportunity.js';
import { ApiError } from '../utils/apiError.js';
import { sendApplicationNotification } from './notification.service.js';

const submitApplication = async (userId, opportunityId, applicationData) => {
  const opportunity = await Opportunity.findById(opportunityId);

  if (!opportunity) {
    throw new ApiError(404, 'Opportunity not found');
  }

  if (opportunity.status !== 'ACTIVE') {
    throw new ApiError(400, 'Opportunity is not active');
  }

  if (new Date(opportunity.deadline) < new Date()) {
    throw new ApiError(400, 'Opportunity deadline has passed');
  }

  const existingApplication = await Application.findOne({
    userId,
    opportunityId,
  });

  if (existingApplication && existingApplication.status !== 'WITHDRAWN') {
    throw new ApiError(409, 'You have already applied for this opportunity');
  }

  const application = await Application.findOneAndUpdate(
    { userId, opportunityId },
    {
      ...applicationData,
      userId,
      opportunityId,
      status: 'SUBMITTED',
      appliedAt: new Date(),
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  // Notify publisher
  sendApplicationNotification(application, opportunityId).catch(console.error);

  return application;
};

const getSeekerApplications = async (userId) => {
  return await Application.find({ userId })
    .populate('opportunityId', 'title organizationName location type status')
    .sort({ appliedAt: -1 });
};

const getOpportunityApplications = async (opportunityId, publisherId) => {
  const opportunity = await Opportunity.findOne({ _id: opportunityId, publisherId });
  if (!opportunity) {
    throw new ApiError(403, 'Unauthorized to view applications for this opportunity');
  }

  return await Application.find({ opportunityId })
    .populate('userId', 'fullName email profilePhotoUrl country')
    .sort({ appliedAt: -1 });
};

const updateApplicationStatus = async (applicationId, publisherId, status, notes) => {
  const application = await Application.findById(applicationId).populate('opportunityId');
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.opportunityId.publisherId.toString() !== publisherId.toString()) {
    throw new ApiError(403, 'Unauthorized to update this application');
  }

  application.status = status;
  application.notes = notes || application.notes;
  application.lastUpdated = new Date();
  await application.save();

  // TODO: Notify seeker of status update
  
  return application;
};

const withdrawApplication = async (applicationId, userId) => {
  const application = await Application.findOneAndUpdate(
    { _id: applicationId, userId, status: { $ne: 'WITHDRAWN' } },
    {
      $set: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
        lastUpdated: new Date(),
      }
    },
    { new: true }
  );

  if (!application) {
    throw new ApiError(404, 'Application not found or already withdrawn');
  }

  return application;
};

const getAllPublisherApplications = async (publisherId) => {
  const opportunities = await Opportunity.find({ publisherId }).select('_id');
  const opportunityIds = opportunities.map(opp => opp._id);

  return await Application.find({ opportunityId: { $in: opportunityIds } })
    .populate('opportunityId', 'title type status')
    .populate('userId', 'fullName email profilePhotoUrl country')
    .sort({ appliedAt: -1 });
};

export {
  submitApplication,
  getSeekerApplications,
  getOpportunityApplications,
  getAllPublisherApplications,
  updateApplicationStatus,
  withdrawApplication,
};
