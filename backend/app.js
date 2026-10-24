const express = require('express');
const helmet = require('helmet');
const createRequestLogger = require('./src/middlewares/requestLogger');
const createCorsMiddleware = require('./src/middlewares/corsMiddleware');
const createApiRateLimiter = require('./src/middlewares/rateLimitMiddleware');
const { notFound, errorHandler } = require('./src/middlewares/errorMiddleware');

const createApp = (config) => {
    // Module routes are loaded after server.js has loaded the environment.
    const scanRoutes = require('./src/routes/scanRoutes');
    const app = express();

    app.use(createRequestLogger(config));
    app.use(helmet());
    app.use(createCorsMiddleware(config));
    app.use(express.json({ limit: '1mb' }));
    app.use('/api', createApiRateLimiter(config));

    // Health check endpoint for container orchestration and uptime monitoring.
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
        });
    });

    app.use('/api/scan', scanRoutes);
    app.use(notFound);
    app.use(errorHandler);

    return app;
};

module.exports = createApp;
