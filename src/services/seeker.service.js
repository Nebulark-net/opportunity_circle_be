import { User } from '../models/User.js';
import { UserPreference } from '../models/UserPreference.js';
import { ApiError } from '../utils/apiError.js';

const updateProfile = async (userId, profileData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: profileData,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const preferences = await UserPreference.findOne({ userId });

  return { user, preferences };
};

const updatePreferences = async (userId, preferencesData) => {
  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    {
      $set: preferencesData,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return preferences;
};

const completeOnboarding = async (userId, { profileData, preferencesData }) => {
  const user = await updateProfile(userId, { ...profileData, onboardingCompleted: true });
  const preferences = await updatePreferences(userId, preferencesData);

  return { user, preferences };
};

export { updateProfile, getProfile, updatePreferences, completeOnboarding };
