/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],

  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text"],

  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!tests/**",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!coverage/**",
    "!**/generated/**"
  ],

  testMatch: [
    "**/tests/unit/**/*.test.ts",
    "**/tests/integration/**/*.test.ts"
  ]
};
