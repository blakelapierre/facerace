import { copyFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const outDir = fileURLToPath(new URL("./.pages", import.meta.url));

function flattenPages(): Plugin {
  return {
    name: "flatten-pages-index",
    closeBundle() {
      const nested = join(outDir, "demo/index.html");
      const index = join(outDir, "index.html");
      renameSync(nested, index);
      copyFileSync(index, join(outDir, "404.html"));
      writeFileSync(join(outDir, ".nojekyll"), "");
      rmSync(join(outDir, "demo"), { recursive: true, force: true });
    },
  };
}

// Static demo for https://blakelapierre.github.io/facerace/
// Kept off the main Vite config so the live preview build stays unchanged.
export default defineConfig({
  base: "/facerace/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), viteReact(), flattenPages()],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL("./demo/index.html", import.meta.url)),
    },
  },
});
