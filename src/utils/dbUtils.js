import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * Execute a function within a Mongoose transaction.
 * @param {Function} fn - The function to execute. Must accept the session as its first argument.
 * @returns {Promise<any>} - The result of the function.
 */
export const withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    // If transactions are not supported (e.g., single node MongoDB), fallback to no transaction
    if (error.codeName === 'CommandNotSupportedOnStandaloneEntity' || 
        error.message.includes('Transaction numbers are only allowed on a replica set member')) {
      logger.warn('Transactions not supported by MongoDB environment. Falling back to non-transactional execution.');
      session.endSession();
      // Execute without session
      return await fn(null);
    }

    await session.abortTransaction();
    logger.error('Transaction aborted due to error:', error);
    throw error;
  } finally {
    if (session.internalSession) {
      session.endSession();
    }
  }
};
