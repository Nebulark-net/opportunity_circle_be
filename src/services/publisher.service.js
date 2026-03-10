import { User } from '../models/User.js';
import { PublisherProfile } from '../models/PublisherProfile.js';
import { ApiError } from '../utils/apiError.js';

const updateProfile = async (userId, profileData) => {
  const profile = await PublisherProfile.findOneAndUpdate(
    { userId },
    {
      $set: profileData,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return profile;
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const profile = await PublisherProfile.findOne({ userId });

  return { user, profile };
};

const completeOnboarding = async (userId, { userUpdate, profileData }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: { ...userUpdate, onboardingCompleted: true },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('-password -refreshToken');

  const profile = await updateProfile(userId, profileData);

  return { user, profile };
};

export { updateProfile, getProfile, completeOnboarding };
