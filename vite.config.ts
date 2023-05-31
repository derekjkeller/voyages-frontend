import { defineConfig } from 'vite';
import { resolve } from 'path';
import dotenv from 'dotenv';
import react from '@vitejs/plugin-react';
import path from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
});