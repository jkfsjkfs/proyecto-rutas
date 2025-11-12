import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy:
      mode === "development"
        ? {
            "/api": {
              target: "http://localhost:5000", // tu backend local
              changeOrigin: true,
              secure: false
            }
          }
        : undefined
  }
}));
