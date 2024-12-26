import httpStatus from 'http-status';

const errorHandler = (err, req, res, next) => {
  // Handle validation errors
  if (err.name === 'ValidationError' || err instanceof ApiError) {
    return res.status(err.statusCode || httpStatus.BAD_REQUEST).json({
      code: err.statusCode || httpStatus.BAD_REQUEST,
      message: err.message, // Clean error message
    });
  }

  // Fallback for other errors
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    code: httpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error', // Avoid exposing internal details
  });
};

export default errorHandler;
