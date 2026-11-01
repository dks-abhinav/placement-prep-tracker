import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Load .env with override so local credentials override Cloud Run placeholder defaults
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env', override: true });
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: false,
  },
});
