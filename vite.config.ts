import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/renderer',
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
    },
  },
  plugins: [
    electron([
      {
        entry: 'src/main/main.ts',
        vite: {
          build: {
            outDir: 'dist/main',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],
});
