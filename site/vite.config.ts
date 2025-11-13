import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@generator": path.resolve(__dirname, "generator"),
      "@checker": path.resolve(__dirname, "checker"),
      "@components": path.resolve(__dirname, "components"),
      "@styles": path.resolve(__dirname, "styles")
    }
  }
});

