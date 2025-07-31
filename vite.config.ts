import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

// Get absolute path to project root
const projectRoot = process.cwd();

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./client/src/**/*.{ts,tsx}"'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "client/src"),
      "@assets": path.resolve(projectRoot, "attached_assets")
    }
  },
  build: {
    outDir: "dist/public",
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      // Add explicit external mapping for problematic imports
      external: (source) => {
        // Add any modules that need explicit externalization
        return false;
      },
      plugins: [
        // Custom plugin to debug unresolved imports
        {
          name: 'debug-unresolved',
          resolveId(source) {
            if (source.includes('ErrorBoundary')) {
              console.log(`Resolving: ${source}`);
              const resolved = this.resolve(source, undefined, { skipSelf: true });
              resolved.then(r => {
                if (!r) console.error(`FAILED TO RESOLVE: ${source}`);
                else console.log(`Resolved ${source} to ${r.id}`);
              });
              return resolved;
            }
            return null;
          }
        }
      ]
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
  base: './',
});
