import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});

const optionalJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // If token is invalid, just proceed as unauthenticated
    next();
  }
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Role: ${req.user.role} is not allowed to access this resource`);
    }
    next();
  };
};

export { verifyJWT, optionalJWT, authorizeRoles };
