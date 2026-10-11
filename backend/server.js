const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middlewares/errorMiddleware');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Health check endpoint for container orchestration and uptime monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});