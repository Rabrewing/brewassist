/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Map @/ to rootDir for imports
    '^@lib/(.*)$': '<rootDir>/lib/$1', // Map @lib/ to lib/ for imports
  },
};
