import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

// Explicitly define __dirname for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname;

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Add path resolver plugin
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./client/src/**/*.{ts,tsx}"'
      }
    })
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "client/src")
      },
      {
        find: "@assets",
        replacement: path.resolve(__dirname, "attached_assets")
      }
    ],
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
});
