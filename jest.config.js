module.exports = {
  projects: [
    {
      displayName: 'picnew-backend',
      testEnvironment: 'node',
      roots: ['<rootDir>/apps/picnew-backend'],
      testMatch: ['**/__tests__/**/*.test.ts'],
      preset: 'ts-jest',
      moduleFileExtensions: ['ts', 'js', 'json'],
      collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
      coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
      testTimeout: 10000,
    },
  ],
};
