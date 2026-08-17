/**
 * Server Launcher (with Vercel Serverless Function support)
 */

require('dotenv').config();
const app = require('./src/app');

// Vercel serverless platform exports the Express handler directly
if (process.env.VERCEL || require.main !== module) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🌊 NagRiver Sentinel Backend API Server`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚡ Mode: ${process.env.MOCK_MODE !== 'false' ? 'MOCK_MODE=true' : 'LIVE'}`);
    console.log(`==================================================`);
  });
}
