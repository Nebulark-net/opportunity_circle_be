import { User } from '../models/User.js';
import { PublisherProfile } from '../models/PublisherProfile.js';
import { ApiError } from '../utils/apiError.js';

const updateProfile = async (userId, profileData) => {
  // Split data — user fields go to User model, org fields to PublisherProfile
  const userFields = {};
  const profileFields = {};

  const userFieldKeys = ['fullName', 'phoneNumber', 'country', 'location', 'profilePhotoUrl'];
  const profileFieldKeys = ['organizationName', 'organizationLogo', 'websiteUrl', 'industry', 'description'];

  Object.keys(profileData).forEach((key) => {
    const val = profileData[key];
    // Skip empty strings for URL fields to avoid overwriting valid urls
    if (key === 'websiteUrl' && val === '') return;
    if (userFieldKeys.includes(key)) userFields[key] = val;
    else if (profileFieldKeys.includes(key)) profileFields[key] = val;
  });

  // Update User document if there are user-level fields
  let updatedUser;
  if (Object.keys(userFields).length > 0) {
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: userFields },
      { new: true, runValidators: false }
    ).select('-password -refreshToken');
  }

  // Upsert PublisherProfile with org-specific fields
  const profile = await PublisherProfile.findOneAndUpdate(
    { userId },
    { $set: profileFields },
    { new: true, upsert: true, runValidators: false }
  );

  return { user: updatedUser, profile };
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
