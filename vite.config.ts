import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Allow overriding base path at build-time using VITE_BASE_PATH (useful when deploying to Vercel / root)
// - For GitHub Pages you can set VITE_BASE_PATH=/dividai/
// - For Vercel leave it unset or set to /
const basePath = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  plugins: [react()],
  base: basePath,
});
