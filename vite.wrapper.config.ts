import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Static shell for the Android wrapper. The live preview keeps using
 * vite.config.ts. This build has no server: the phone app loads the files.
 */
export default defineConfig({
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
