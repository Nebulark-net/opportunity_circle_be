import { ApiError } from '../utils/apiError.js';

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Assign parsed (coerced) values back to the request
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    
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
