import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Static shell for the Android wrapper and for GitHub Pages.
 * The live preview keeps using vite.config.ts.
 * PAGES_BASE is set only for the public site, so asset links stay relative
 * and the desk opens from a folder or a file host. The phone package is
 * served from the root.
 */
const base = process.env.PAGES_BASE || "/";

export default defineConfig({
  base,
  resolve: { tsconfigPaths: true },
  define: {
    "import.meta.env.VITE_WRAPPER": JSON.stringify("true"),
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: { outputPath: "/index.html" },
      },
    }),
    viteReact(),
  ],
});
