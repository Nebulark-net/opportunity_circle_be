import { User } from '../models/User.js';
import { UserPreference } from '../models/UserPreference.js';
import { Opportunity } from '../models/Opportunity.js';
import { sendEmail } from '../config/email.js';
import logger from '../utils/logger.js';

const sendWeeklyDigest = async () => {
  try {
    const seekers = await User.find({
      role: 'SEEKER',
      isDeleted: false,
    });

    for (const seeker of seekers) {
      const preferences = await UserPreference.findOne({ userId: seeker._id });
      if (!preferences || !preferences.weeklyDigest) continue;

      // Find relevant opportunities based on preferences
      const query = {
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      };

      if (preferences.interestedTypes?.length > 0) {
        query.type = { $in: preferences.interestedTypes };
      }

      const relevantOpportunities = await Opportunity.find(query).limit(5);

      if (relevantOpportunities.length > 0) {
        await sendEmail({
          to: seeker.email,
          subject: 'Your Weekly Opportunity Digest',
          template: 'weekly-digest',
          context: {
            fullName: seeker.fullName,
            opportunities: relevantOpportunities.map(opp => ({
              title: opp.title.en,
              organizationName: opp.organizationName,
              type: opp.type,
              url: `${process.env.FRONTEND_URL}/opportunities/${opp._id}`,
            })),
          },
        });
        logger.info(`Weekly digest sent to ${seeker.email}`);
      }
    }
  } catch (error) {
    logger.error('Error in sendWeeklyDigest:', error);
  }
};

export { sendWeeklyDigest };
