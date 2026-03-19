import { ApiError } from '../utils/apiError.js';

/**
 * Middleware to restrict access based on user roles
 * @param {...string} allowedRoles - The roles permitted to access the route
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role: ${req.user.role} is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Access denied. Admin only.'));
  }
  next();
};

export const isPublisher = (req, res, next) => {
  if (req.user?.role !== 'PUBLISHER' && req.user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Access denied. Publisher or Admin only.'));
  }
  next();
};

export const isSeeker = (req, res, next) => {
  if (req.user?.role !== 'SEEKER' && req.user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Access denied. Seeker or Admin only.'));
  }
  next();
};
