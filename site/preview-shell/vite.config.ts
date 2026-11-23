import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compatibilityPlugin } from "./compatibility.mjs";
import { createPreviewApp } from "./server/previewApp.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));

function authenticatedPreviewApiPlugin(): Plugin {
  return {
    name: "medibo-authenticated-preview-api",
    configureServer(server) {
      server.middlewares.use(
        createPreviewApp({ fallthrough: true }) as never,
      );
    },
    configurePreviewServer(server) {
      server.middlewares.use(
        createPreviewApp({ fallthrough: true }) as never,
      );
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), compatibilityPlugin(), authenticatedPreviewApiPlugin()],
  resolve: { alias: { "@": path.resolve(root, "src") } },
  build: { outDir: "dist/public", emptyOutDir: true },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 4173),
    strictPort: true,
    allowedHosts: ["localhost", ".replit.dev"],
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 4173),
    strictPort: true,
    allowedHosts: ["localhost", ".replit.dev"],
  },
});
