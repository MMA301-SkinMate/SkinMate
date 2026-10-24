const path = require('node:path');
const dotenv = require('dotenv');
const Joi = require('joi');

const schema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'test', 'production')
        .default('development'),
    PORT: Joi.number().integer().min(1).max(65535).default(5000),
    MONGO_URI: Joi.string()
        .trim()
        .pattern(/^mongodb(?:\+srv)?:\/\/[^/?#\s]+(?:[/?]\S*)?$/)
        .required(),
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
    });
};

module.exports = { loadConfig };
