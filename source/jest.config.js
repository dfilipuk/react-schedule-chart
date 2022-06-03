module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  modulePaths: ['node_modules', '<rootDir>'],
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
