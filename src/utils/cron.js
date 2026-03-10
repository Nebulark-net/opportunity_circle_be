import cron from 'node-cron';
import { Opportunity } from '../models/Opportunity.js';
import { sendWeeklyDigest } from '../services/email.service.js';
import logger from './logger.js';

const initCronJobs = () => {
  // Every Sunday at 9 AM: Send Weekly Digest
  cron.schedule('0 9 * * 0', async () => {
    logger.info('Running Weekly Digest Cron Job');
    await sendWeeklyDigest();
  });

  // Every Hour: Expire Opportunities
  cron.schedule('0 * * * *', async () => {
    logger.info('Running Opportunity Expiration Cron Job');
    try {
      const result = await Opportunity.updateMany(
        {
          status: 'ACTIVE',
          deadline: { $lt: new Date() },
          isDeleted: false,
        },
        {
          $set: { status: 'EXPIRED' },
        }
      );
      logger.info(`Expired ${result.modifiedCount} opportunities`);
    } catch (error) {
      logger.error('Error in Opportunity Expiration Cron Job:', error);
    }
  });

  logger.info('Cron Jobs initialized');
};

export default initCronJobs;
