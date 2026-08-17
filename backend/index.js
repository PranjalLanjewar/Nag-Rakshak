/**
 * Server Launcher
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🌊 NagRiver Sentinel Backend API Server`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ Mode: ${process.env.MOCK_MODE !== 'false' ? 'MOCK_MODE=true' : 'LIVE'}`);
  console.log(`==================================================`);
});
