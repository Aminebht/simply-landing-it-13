import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/netlify': {
        target: 'https://api.netlify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/netlify/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Fix CORS header duplication issue
            const headers = proxyRes.headers;
            if (headers['access-control-allow-origin']) {
              if (Array.isArray(headers['access-control-allow-origin'])) {
                headers['access-control-allow-origin'] = headers['access-control-allow-origin'][0];
              }
            }
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
