import mongoose, { Schema } from 'mongoose';

const passwordResetTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' }, // Auto-delete on expiry
    },
  },
  {
    timestamps: true,
  }
);

export const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
