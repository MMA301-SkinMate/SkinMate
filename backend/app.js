const express = require('express');
const helmet = require('helmet');
const createRequestLogger = require('./src/middlewares/requestLogger');
const createCorsMiddleware = require('./src/middlewares/corsMiddleware');
const createApiRateLimiter = require('./src/middlewares/rateLimitMiddleware');
const createDocsRoutes = require('./src/routes/docsRoutes');
const openApi = require('./src/docs/openapi');
const { notFound, errorHandler } = require('./src/middlewares/errorMiddleware');

const createApp = (config) => {
    // Module routes are loaded after server.js has loaded the environment.
    const scanRoutes = require('./src/routes/scanRoutes');
    const authRoutes = require('./src/routes/authRoutes');
    const app = express();
    app.locals.config = config;

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

    app.get('/api-docs.json', (req, res) => {
        res.set('Cache-Control', 'no-store');
        return res.json(openApi);
    });
    app.use('/api-docs', createDocsRoutes(config));

    app.use('/api/scan', scanRoutes);
    app.use('/api/auth', authRoutes());
    app.use(notFound);
    app.use(errorHandler);

    return app;
};

module.exports = createApp;
