const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middlewares/errorMiddleware');

const authRoutes = require('./src/routes/authRoutes');
const collectionRoutes = require('./src/routes/collectionRoutes');
const routineRoutes = require('./src/routes/routineRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const scanRoutes = require('./src/routes/scanRoutes');
const dictionaryRoutes = require('./src/routes/dictionaryRoutes');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Health check endpoint for container orchestration and uptime monitoring
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        appName: 'SkinMate API',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/routine', routineRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/dictionary', dictionaryRoutes);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});