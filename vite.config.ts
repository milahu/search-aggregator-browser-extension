import { crx } from "@crxjs/vite-plugin";
import { resolve } from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import WindiCSS from "vite-plugin-windicss";
import manifest from "./src/manifest";

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const assetsDir = resolve(root, "assets");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");

const isDev = process.env.__DEV__ === "true";
//console.log("vite.config.ts: isDev", isDev)

// TODO port

export default defineConfig(({ command }) => ({
  //base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    //port,
    hmr: {
      host: 'localhost',
    },
  },
  clearScreen: false,
  plugins: [solidPlugin(), crx({ manifest }), WindiCSS()],
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir,
    },
  },
  publicDir,
  build: {
    outDir,
    emptyOutDir: false,
    //sourcemap: isDev,
    sourcemap: isDev ? 'inline' : false,
    minify: !isDev,
    rollupOptions: {
      input: {
      //   devtools: resolve(pagesDir, "devtools", "index.html"),
      //   panel: resolve(pagesDir, "panel", "index.html"),
      //   content: resolve(pagesDir, "content", "index.ts"),
      //   background: resolve(pagesDir, "background", "index.ts"),
      //   contentStyle: resolve(pagesDir, "content", "style.scss"),
        popup: resolve(pagesDir, "popup", "index.html"),
      //   newtab: resolve(pagesDir, "newtab", "index.html"),
        options: resolve(pagesDir, "options", "index.html"),
      },
      /*
      output: {
        entryFileNames: "src/pages/[name]/index.js",
        chunkFileNames: isDev
          ? "assets/js/[name].js"
          : "assets/js/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          const { dir, name: _name } = path.parse(assetInfo.name);
          // const assetFolder = getLastElement(dir.split("/"));
          // const name = assetFolder + firstUpperCase(_name);
          return `assets/[ext]/${name}.chunk.[ext]`;
        },
      },
      */
    },
  },
  optimizeDeps: {
    include: [
      //'vue',
      //'@vueuse/core',
      //'webextension-polyfill',
    ],
    exclude: [
      //'@engine262/engine262',
      //'sval',
      'sval',
      'acorn',
    ],
  },
}));
