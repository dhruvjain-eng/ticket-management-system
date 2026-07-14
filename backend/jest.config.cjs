/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/integration/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/env.cjs"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "esbuild-jest",
      {
        format: "esm",
        target: "node20",
      },
    ],
  },
  testTimeout: 30_000,
};
