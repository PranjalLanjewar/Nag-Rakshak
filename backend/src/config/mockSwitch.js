/**
 * Dynamic Mock Mode Resolver Middleware & Helper
 * Ownership: Person 2 & 3 (Backend Config)
 */

let localMockMode = process.env.MOCK_MODE !== 'false';

/**
 * Checks if a given request should run in mock mode
 */
function isMock(req) {
  if (req) {
    // 1. Check custom HTTP header
    if (req.headers && req.headers['x-mock-mode']) {
      return req.headers['x-mock-mode'] === 'true';
    }
    // 2. Check query parameter
    if (req.query && req.query.mock) {
      return req.query.mock === 'true';
    }
  }
  // 3. Fallback to process.env.MOCK_MODE
  return localMockMode;
}

/**
 * Sets the default fallback mock mode dynamically
 */
function setMockMode(val) {
  localMockMode = !!val;
}

/**
 * Returns the default fallback mock mode
 */
function getMockMode() {
  return localMockMode;
}

module.exports = {
  isMock,
  setMockMode,
  getMockMode
};
