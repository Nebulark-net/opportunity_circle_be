import { Opportunity } from '../models/Opportunity.js';
import { OpportunityView } from '../models/OpportunityView.js';
import { Application } from '../models/Application.js';
import mongoose from 'mongoose';

const getPublisherStats = async (publisherId) => {
  const opportunities = await Opportunity.find({ publisherId });
  const opportunityIds = opportunities.map(opp => opp._id);

  const stats = await Opportunity.aggregate([
    { $match: { publisherId: new mongoose.Types.ObjectId(publisherId) } },
    {
      $facet: {
        totalListings: [{ $count: 'count' }],
        statusBreakdown: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
      }
    }
  ]);

  const viewStats = await OpportunityView.aggregate([
    { $match: { opportunityId: { $in: opportunityIds } } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        uniqueViews: { $addToSet: '$userId' },
      }
    }
  ]);

  const applicantStats = await Application.aggregate([
    { $match: { opportunityId: { $in: opportunityIds } } },
    {
      $facet: {
        totalApplicants: [{ $count: 'count' }],
        statusBreakdown: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  return {
    totalListings: stats[0].totalListings[0]?.count || 0,
    listingStatusBreakdown: stats[0].statusBreakdown,
    totalViews: viewStats[0]?.totalViews || 0,
    uniqueViews: viewStats[0]?.uniqueViews.length || 0,
    totalApplicants: applicantStats[0].totalApplicants[0]?.count || 0,
    applicationStatusBreakdown: applicantStats[0].statusBreakdown,
  };
};

const trackOpportunityView = async ({ opportunityId, userId, viewerIp }) => {
  await OpportunityView.create({
    opportunityId,
    userId,
    viewerIp,
    viewedAt: new Date(),
  });

  await Opportunity.findByIdAndUpdate(opportunityId, {
    $inc: { viewCount: 1 },
  });
};

export { getPublisherStats, trackOpportunityView };
