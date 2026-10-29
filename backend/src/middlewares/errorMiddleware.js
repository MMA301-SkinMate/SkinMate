const { STATUS_CODES } = require('node:http');
const { MulterError } = require('multer');
const AppError = require('../utils/AppError');

const notFound = (req, res, next) =>
    next(new AppError('Route not found.', 404, 'NOT_FOUND'));

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode =
        [err.statusCode, err.status, res.statusCode].find(
            (status) =>
                Number.isInteger(status) && status >= 400 && status <= 599
        ) || 500;
    let code = 'HTTP_ERROR';
    let message = STATUS_CODES[statusCode] || 'Request failed.';
    let details = [];

    if (err instanceof AppError) {
        code = err.code;
        message = err.message;
        details = Array.isArray(err.details) ? err.details : [];
    } else if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        code = 'INVALID_JSON';
        message = 'Request body must contain valid JSON.';
    } else if (err.type === 'entity.too.large') {
        statusCode = 413;
        code = 'BODY_TOO_LARGE';
        message = 'JSON body exceeds the 1 MB limit.';
    } else if (err instanceof MulterError) {
        const tooLarge = err.code === 'LIMIT_FILE_SIZE';
        statusCode = tooLarge ? 413 : 400;
        code = tooLarge ? 'UPLOAD_TOO_LARGE' : 'INVALID_UPLOAD';
        message = tooLarge
            ? 'Uploaded file is too large.'
            : 'Invalid file upload.';
    }

    if (statusCode >= 500) {
        code = 'INTERNAL_SERVER_ERROR';
        message = 'Internal server error.';
        details = [];
    }

    return res.status(statusCode).json({
        success: false,
        message,
        error: { code, details },
        requestId: req.id,
    });
};

module.exports = { notFound, errorHandler };
