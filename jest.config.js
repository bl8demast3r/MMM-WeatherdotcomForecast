// The Weather.com and NOAA fixtures were captured in America/New_York, and
// the expected times are written for that time zone
process.env.TZ = "America/New_York";

module.exports = {
  verbose: true,
  testTimeout: 20000,
  testMatch: ["**/tests/**/*_spec.js"],
  moduleNameMapper: {
    logger: "<rootDir>/js/logger.js"
  },
  collectCoverageFrom: ["*.js"],
  coverageReporters: ["lcov", "text"],
  coverageProvider: "v8"
};
