import { fileURLToPath, URL } from "url";
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { readFileSync } from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    https: {
      key: readFileSync(path.resolve(__dirname, 'ssl/localhost-key.pem')),
      cert: readFileSync(path.resolve(__dirname, 'ssl/localhost.pem'))
    },
    port: 3000
  }
})