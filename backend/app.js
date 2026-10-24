const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./src/middlewares/errorMiddleware');

const createApp = () => {
    // Module routes are loaded after server.js has loaded the environment.
    const scanRoutes = require('./src/routes/scanRoutes');
    const app = express();

    app.use(cors());
    app.use(express.json());

    // Health check endpoint for container orchestration and uptime monitoring.
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
        });
    });

    app.use('/api/scan', scanRoutes);
    app.use(errorHandler);

    return app;
};

module.exports = createApp;
