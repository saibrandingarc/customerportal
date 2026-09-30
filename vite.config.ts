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
    }
  },
  server: {
    // Default Vite 2 binds 127.0.0.1:3000 only. localhost prefers ::1, and
    // another local app already owns IPv6 :3000, so https://localhost hits
    // plain HTTP and Chrome reports ERR_SSL_PROTOCOL_ERROR.
    host: true,
    port: 5173,
    strictPort: true,
    https: {
      key: readFileSync(path.resolve(__dirname, 'ssl/localhost-key.pem')),
      cert: readFileSync(path.resolve(__dirname, 'ssl/localhost.pem'))
    }
  }
})