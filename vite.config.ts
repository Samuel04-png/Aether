import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Root path
  resolve: {
    alias: {
      // allow '@/...' imports to resolve to project root
      '@': path.resolve(__dirname, '.'),
    },
  },
});
