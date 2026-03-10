import { ApiError } from '../utils/apiError.js';

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error.errors) {
      const errorMessage = error.errors.map((err) => `${err.path?.join('.') || err.message}: ${err.message}`).join(', ');
      throw new ApiError(400, errorMessage);
    }
    throw new ApiError(400, error.message || 'Validation failed');
  }
};

export default validate;
