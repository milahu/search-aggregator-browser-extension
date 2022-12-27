import { crx } from "@crxjs/vite-plugin";
import { resolve } from "path";
import fs from "fs";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import WindiCSS from "vite-plugin-windicss";
import manifest from "./manifest";

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const assetsDir = resolve(root, "assets");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");

// TODO port

const outputAssetsDir = '';
const outputDefaults = {
  // remove hashes from filenames
  entryFileNames: `${outputAssetsDir}[name].js`,
  chunkFileNames: `${outputAssetsDir}[name].js`,
  // TODO move icons to icons/
  assetFileNames: `${outputAssetsDir}[name].[ext]`,
}

export default defineConfig(({ command }) => {

//console.log("vite.config.ts: command", command)
const isDev = (
  process.env.__DEV__ === "true" ||
  command === "serve"
);
//console.log("vite.config.ts: isDev", isDev)
const isProd = !isDev;

return {
  //base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    //port,
    hmr: {
      host: 'localhost',
    },
  },
  clearScreen: false,
  plugins: [
    solidPlugin(),
    crx({ manifest }),
    WindiCSS(),
  ],
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
    //emptyOutDir: false, // keep old files. this is no caching
    // true -> 15 seconds
    // false -> 15 seconds
    sourcemap: isDev ? 'inline' : false,
    // default -> 20 seconds
    // false -> 15 seconds
    minify: isProd,
    rollupOptions: {
      // true -> 20 seconds
      // false -> 15 seconds
      treeshake: isProd,
      // needed for output.preserveModules
      preserveEntrySignatures: isDev ? "strict" : false,
      output: {
        ...outputDefaults,
        format: 'esm',
        //dir: 'dist',
        // false -> 30 seconds
        // true -> 15 seconds
        preserveModules: isDev,
        preserveModulesRoot: __dirname,
        //manualChunks,
      },
      external: [
        //"sval",
      ],
    },
  },
  optimizeDeps: {
    include: [
      //'vue',
      //'@vueuse/core',
      //'webextension-polyfill',
    ],
    exclude: [
      /*
      'solid-js',
      'sval',
      'acorn',
      "@hope-ui/solid",
      */
    ],
  },
};

});
