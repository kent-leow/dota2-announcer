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
        entry: resolve(__dirname, 'src/main/main.ts'),
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist/main'),
            rollupOptions: {
              external: ['electron'],
            },
          },
          resolve: {
            alias: {
              src: resolve(__dirname, 'src'),
            },
          },
        },
      },
      {
        entry: resolve(__dirname, 'src/main/preload.ts'),
        onstart(args) {
          args.reload();
        },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist/main'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        entry: resolve(__dirname, 'src/main/overlayPreload.ts'),
        onstart(args) {
          args.reload();
        },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist/main'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],
});
