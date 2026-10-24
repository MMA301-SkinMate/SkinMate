const path = require('node:path');
const dotenv = require('dotenv');
const Joi = require('joi');

const parseOrigins = (origins) =>
    [
        ...new Set(
            origins
                .split(',')
                .map((origin) => origin.trim())
                .filter(Boolean)
        ),
    ].map((origin) => {
        const url = new URL(origin);
        if (
            !['http:', 'https:'].includes(url.protocol) ||
            url.username ||
            url.password ||
            url.pathname !== '/' ||
            url.search ||
            url.hash
        ) {
            throw new Error('Invalid origin.');
        }
        return url.origin;
    });

const schema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'test', 'production')
        .default('development'),
    PORT: Joi.number().integer().min(1).max(65535).default(5000),
    MONGO_URI: Joi.string()
        .trim()
        .pattern(/^mongodb(?:\+srv)?:\/\/[^/?#\s]+(?:[/?]\S*)?$/)
        .required(),
    LOG_LEVEL: Joi.string()
        .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
        .default('info'),
    CORS_ORIGINS: Joi.string()
        .allow('')
        .default('')
        .custom((value, helpers) => {
            try {
                parseOrigins(value);
                return value;
            } catch {
                return helpers.error('any.invalid');
            }
        }),
    RATE_LIMIT_MAX: Joi.number().integer().positive().default(100),
});

const loadConfig = () => {
    const result = dotenv.config({
        path: path.resolve(__dirname, '../../.env'),
        quiet: true,
        override: false,
    });

    if (result.error && result.error.code !== 'ENOENT') {
        const error = new Error('Unable to read backend/.env.');
        error.code = 'ENV_READ_ERROR';
        throw error;
    }

    const { error, value } = schema.validate(process.env, {
        abortEarly: false,
        allowUnknown: true,
    });

    if (error) {
        const fields = [
            ...new Set(error.details.map((detail) => detail.path.join('.'))),
        ];
        const configError = new Error(
            `Invalid environment configuration: ${fields.join(', ')}. Check backend/.env.`
        );
        configError.code = 'INVALID_ENV';
        throw configError;
    }

    return Object.freeze({
        nodeEnv: value.NODE_ENV,
        port: value.PORT,
        mongoUri: value.MONGO_URI,
        logLevel: value.LOG_LEVEL,
        corsOrigins: Object.freeze(parseOrigins(value.CORS_ORIGINS)),
        rateLimitMax: value.RATE_LIMIT_MAX,
    });
};

module.exports = { loadConfig };
