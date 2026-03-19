import mongoose from 'mongoose';

const onboardingDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  interests: [{
    type: String,
  }],
  preferences: {
    fieldOfStudy: { type: String },
    targetLocations: [{ type: String }],
    employeeType: { type: String },
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const OnboardingData = mongoose.model('OnboardingData', onboardingDataSchema);
