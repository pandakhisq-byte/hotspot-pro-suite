import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// Pure Vite + React SPA. `vite build` emits a static `dist/`
// that deploys directly to cPanel / DirectAdmin / any static host.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { host: "::", port: 8080, strictPort: true },
  build: { outDir: "dist", sourcemap: false },
});
