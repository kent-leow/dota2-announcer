import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'main',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/main/**/*.spec.ts'],
      preset: 'ts-jest',
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'renderer',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/renderer/**/*.spec.{ts,tsx}'],
      preset: 'ts-jest',
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss)$': 'identity-obj-proxy',
      },
    },
    {
      displayName: 'services',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      testPathIgnorePatterns: ['/src/main/', '/src/renderer/'],
      preset: 'ts-jest',
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
      },
    },
  ],
};

export default config;
