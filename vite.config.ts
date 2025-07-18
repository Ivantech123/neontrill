import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false, // Disable default error overlay to prevent duplicate custom-element registration
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      // Only import server in dev mode
      if (process.env.NODE_ENV !== 'production') {
        try {
          const { createServer } = await import("./server/index.js");
          const app = createServer();
          server.middlewares.use(app);
        } catch (e) {
          console.warn('Server import failed in dev mode:', e);
        }
      }
    },
  };
}
