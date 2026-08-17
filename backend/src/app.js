/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const segmentRoutes = require('./routes/segments');
const scoringRoutes = require('./routes/scoring');
const groundAiRoutes = require('./routes/ground-ai');
const syncRoutes = require('./routes/sync');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve assets folder statically so uploaded / sample ground photos load in UI
app.use('/assests', express.static(path.join(__dirname, '../../assests')));
app.use('/uploads', express.static(path.join(__dirname, '../../assests')));

// API Routes
app.use('/api/segments', segmentRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/segments', groundAiRoutes);
app.use('/api/satellite', syncRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'NagRiver Sentinel Backend API',
    mock_mode: process.env.MOCK_MODE !== 'false',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
