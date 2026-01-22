import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/track123': {
        target: 'https://api.track123.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/track123/, ''),
      },
    },
  },
});
