import react from "@vitejs/plugin-react-swc";
import * as fs from "fs";
import path from "path";
import url from "url";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import pluginRewriteAll from "vite-plugin-rewrite-all";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      port: 3001,
      host: "0.0.0.0",
      proxy: {
        "/v1": {
          target: env.VITE_DEV_SERVER_URL,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      pluginRewriteAll(),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.png"],
        devOptions: {
          enabled: false,
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,png,svg,json}"],
          navigateFallbackDenylist: [/^\/v1/],
          maximumFileSizeToCacheInBytes: 10000000,
        },
        manifest: {
          name: "laf",
          short_name: "Laf",
          description: "life is short, you need laf:)",
          theme_color: "#eef0f2",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["monaco-editor", "vscode"],
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            }
          },
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: "import.meta.url",
            setup({ onLoad }) {
              // Help vite that bundles/move files in dev mode without touching `import.meta.url` which breaks asset urls
              onLoad({ filter: /.*\.js/, namespace: "file" }, async (args) => {
                if (args.path.endsWith(".json")) return;
                const code = fs.readFileSync(args.path, "utf8");
                const assetImportMetaUrlRE =
                  /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g;
                let i = 0;
                let newCode = "";
                for (
                  let match = assetImportMetaUrlRE.exec(code);
                  match != null;
                  match = assetImportMetaUrlRE.exec(code)
                ) {
                  newCode += code.slice(i, match.index);
                  const path = match[1].slice(1, -1);

                  const resolved = await import.meta.resolve!(path, url.pathToFileURL(args.path));
                  newCode += `new URL(${JSON.stringify(
                    url.fileURLToPath(resolved),
                  )}, import.meta.url)`;
                  i = assetImportMetaUrlRE.lastIndex;
                }
                newCode += code.slice(i);
                return { contents: newCode };
              });
            },
          },
        ],
      },
    },
  };
});
