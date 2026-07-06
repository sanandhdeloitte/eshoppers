import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  ['src/test-setup.ts'],
    typecheck: {
      tsconfig: './tsconfig.spec.json',  
    },
    coverage: {
      provider:         'v8',
      reporter:         ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 85,
        branches:   85,
        functions:  85,
        lines:      85,
        perFile:    false,
      },
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/main.ts',
        'src/environments/**',
        'src/**/*.model.ts',
        'src/**/*.routes.ts',
        'src/app/app.config.ts',
      ],
    },
  },
});
