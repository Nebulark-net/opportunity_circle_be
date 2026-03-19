import { OnboardingData } from '../models/OnboardingData.js';
import { User } from '../models/User.js';
import { UserPreference } from '../models/UserPreference.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import asyncHandler  from '../utils/asyncHandler.js';

const saveOnboardingStep = asyncHandler(async (req, res) => {
  const { interests, preferences, isCompleted } = req.body;
  const userId = req.user._id;

  let onboarding = await OnboardingData.findOne({ userId });

  if (!onboarding) {
    onboarding = new OnboardingData({ userId });
  }

  if (interests) onboarding.interests = interests;
  if (preferences) onboarding.preferences = { ...onboarding.preferences, ...preferences };
  if (isCompleted !== undefined) onboarding.isCompleted = isCompleted;

  await onboarding.save();

  // Update user model and preferences if onboarding is complete
  if (isCompleted) {
    await User.findByIdAndUpdate(userId, { onboardingCompleted: true });

    // Sync to UserPreference for seekers
    if (req.user.role === 'SEEKER') {
      await UserPreference.findOneAndUpdate(
        { userId },
        {
          $set: {
            interestedTypes: onboarding.interests,
            fieldOfStudy: onboarding.preferences?.fieldOfStudy,
            targetLocations: onboarding.preferences?.targetLocations,
            employeeType: onboarding.preferences?.employeeType,
          }
        },
        { upsert: true }
      );
    }
  }

  return res.status(200).json(
    new ApiResponse(200, onboarding, 'Onboarding data saved successfully')
  );
});

const getOnboardingData = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const onboarding = await OnboardingData.findOne({ userId });

  if (!onboarding) {
    throw new ApiError(404, 'Onboarding data not found');
  }

  return res.status(200).json(
    new ApiResponse(200, onboarding, 'Onboarding data retrieved successfully')
  );
});

export {
  saveOnboardingStep,
  getOnboardingData,
};
