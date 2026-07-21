/** @type {import('jest').Config} */
const sharedConfig = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/env.cjs"],
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
};

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      ...sharedConfig,
      displayName: "unit",
      testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
    },
    {
      ...sharedConfig,
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
      testTimeout: 30_000,
    },
  ],
};
