import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/lottie-web") || id.includes("node_modules/lottie-react")) {
            return "vendor-lottie";
          }
          if (id.includes("node_modules/recharts")) {
            return "vendor-charts";
          }
        },
      },
    },
  },
});
