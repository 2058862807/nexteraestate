// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

// Get directory name in ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Essential for path resolution
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./client/src/**/*.{ts,tsx}"'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@assets": path.resolve(__dirname, "attached_assets")
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  build: {
    outDir: "dist/public",
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          radix: [/@radix-ui/],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          vendor: ['lucide-react', 'wouter', 'tailwind-merge']
        }
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    },
    port: 3000,
    strictPort: true
  },
  root: "./client",
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@tanstack/react-query']
  }
});
