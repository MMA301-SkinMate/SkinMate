const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const connectDB = require('./src/config/db');
const collectionRoutes = require('./src/routes/collectionRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const { startExpiryScheduler } = require('./src/services/expiryNotificationService');
const scanRoutes = require('./src/routes/scanRoutes');
const { errorHandler } = require('./src/middlewares/errorMiddleware');

const app = express();
connectDB();

const tempDir = path.join(__dirname, 'temp');
const productUploadsDir = path.join(__dirname, 'uploads/products');
const communityUploadsDir = path.join(__dirname, 'uploads/community');
[tempDir, productUploadsDir, communityUploadsDir].forEach(directory => {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
});

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() }));
app.use('/api/collections', collectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/scan', scanRoutes);
app.use((req, res) => res.status(404).json({ error: { message: 'Endpoint not found', code: 'NOT_FOUND' } }));
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  startExpiryScheduler();
});
