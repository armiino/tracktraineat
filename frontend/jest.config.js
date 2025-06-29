/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: "./",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  moduleDirectories: ["node_modules", "src"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testMatch: [
    "**/src/tests/unit/**/*.test.(ts|tsx)",
    "**/src/tests/integration/**/*.test.(ts|tsx)",
  ],

  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!coverage/**",
    "!**/generated/**",
  ],
};
