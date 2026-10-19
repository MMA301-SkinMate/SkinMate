const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const collectionRoutes = require('./src/routes/collectionRoutes');
const { errorHandler } = require('./src/middlewares/errorMiddleware');
const { assertConfiguration } = require('./src/services/authService');
const AppError = require('./src/errors/app-error');

assertConfiguration();

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Health check endpoint for container orchestration and uptime monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use((req, res, next) => {
  next(
    new AppError(
      'Endpoint not found',
      404,
      'NOT_FOUND'
    )
  );
});
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});