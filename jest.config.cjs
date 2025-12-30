/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Map @/ to rootDir for imports
    '^@lib/(.*)$': '<rootDir>/lib/$1', // Map @lib/ to lib/ for imports
    '^@test-helpers/(.*)$': '<rootDir>/__tests__/helpers/$1', // Map @test-helpers/ to __tests__/helpers/ for imports
  },
};
