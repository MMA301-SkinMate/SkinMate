const AppError = require('../errors/app-error');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal Server Error';

if (err instanceof AppError) {
  const isClientError = Number.isInteger(err.statusCode)
   && err.statusCode >= 400 
   && err.statusCode < 500;

   if(isClientError){
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
   }
  }

else if(err.type==='entity.parse.failed'){
  statusCode = 400;
  code = 'BAD_REQUEST';
  message = 'Request body must contain valid JSON'; 
}
else if (err.type === 'entity.too.large') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body is too large';
  } else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'Resource already exists';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Submitted data is invalid';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_VALUE';
    message = 'A submitted value has an invalid format';
  } else if (
    err.name === 'TokenExpiredError' ||
    err.name === 'JsonWebTokenError' ||
    err.name === 'NotBeforeError'
  ) {
    statusCode = 401;
    code = 'INVALID_ACCESS_TOKEN';
    message = 'Access token is invalid or expired';
  }

  if (statusCode >= 500) {
    // Do not log request bodies, headers, tokens, or raw database errors.
    console.error('Unhandled request error', {
      method: req.method,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      status: statusCode,
    },
  });
}

module.exports = { errorHandler };
