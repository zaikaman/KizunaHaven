import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80
      }
    }
  },
  esbuild: {
    jsxFactory: 'ReactEcs.createElement',
    jsxFragment: 'ReactEcs.Fragment',
    jsx: 'transform'
  },
  resolve: {
    alias: [
      { find: /^~system\/.*/, replacement: path.resolve(__dirname, './tests/mocks/system-mock.ts') },
      { find: '@', replacement: path.resolve(__dirname, './src') }
    ]
  }
});
