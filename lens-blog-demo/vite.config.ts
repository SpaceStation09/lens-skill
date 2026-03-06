import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@lens-blog/core": path.resolve(__dirname, "../packages/lens-blog-core/src/index.ts"),
      "@lens-blog/adapter-lens": path.resolve(
        __dirname,
        "../packages/lens-blog-adapter-lens/src/index.ts"
      ),
      "@lens-blog/theme-default": path.resolve(
        __dirname,
        "../packages/lens-blog-theme-default/src/index.tsx"
      ),
    },
  },
});
