import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

export default defineConfig({
  base: "/whiteboard/",
  build: {
    outDir: "build",
  },
  plugins: [reactRefresh()],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
