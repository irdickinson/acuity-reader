import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // IMPORTANT: vite.config.ts is already inside apps/desktop
        entry: "electron/main.ts",
        vite: {
          build: {
            rollupOptions: {
              external: [
                "electron",
                "linkedom",
                "@mozilla/readability",
                "canvas",            // <-- key fix
              ],
            },
          },
        },
      },
      {
        entry: "electron/preload.ts",
        vite: {
          build: {
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
    ]),
  ],

  // Prevent Vite from prebundling these (also avoids canvas resolution)
  optimizeDeps: {
    exclude: ["linkedom", "@mozilla/readability", "canvas"],
  },
});