/*
TODO faster
https://vitejs.dev/config/dep-optimization-options.html



node_modules/vite/dist/node/chunks/dep-0bae2027.js

async function doBuild(inlineConfig = {}) {

    const rollupOptions = {
        context: 'globalThis',
        preserveEntrySignatures: ssr
            ? 'allow-extension'
            : libOptions
                ? 'strict'
                : false,
        ...options.rollupOptions,
        input,
        plugins,
        external,
        onwarn(warning, warn) {
            onRollupWarning(warning, warn, config);
        },
    };

!!!!
        // watch file changes with rollup
        if (config.build.watch) {
            const { watch } = await import('rollup');
            const watcher = watch({
                ...rollupOptions,
                output: normalizedOutputs,
                watch: {
                    ...config.build.watch,
                    chokidar: resolvedChokidarOptions,
                },
            });
            return watcher;
        }

        // write or generate files with rollup
        const { rollup } = await import('rollup');
        const bundle = await rollup(rollupOptions);



https://rollupjs.org/guide/en/#cache

const rollup = require('rollup');
let cache;

async function buildWithCache() {
  const bundle = await rollup.rollup({
    cache // is ignored if falsy
    // ... other input options
  });
  cache = bundle.cache; // store the cache object of the previous build
  return bundle;
}

buildWithCache()
  .then(bundle => {
    // ... do something with the bundle
  })
  .then(() => buildWithCache()) // will use the cache of the previous build
  .then(bundle => {
    // ... do something with the bundle
  });

*/

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

function traceBuild() {
  return {
    name: "trace-build",
    transformIndexHtml() { console.log("trace-build: transformIndexHtml"); },
    generateBundle() { console.log("trace-build: generateBundle"); }, // not called
    //buildEnd() { console.log("trace-build: buildEnd: this", this); },
    closeBundle() {
      // If a plugin wants to retain resources across builds in watch mode,
      // they can check for this.meta.watchMode in this hook
      // and perform the necessary cleanup for watch mode in closeWatcher.
      console.log("trace-build: closeBundle: this", this);
      console.log("trace-build: closeBundle: this.cache", this.cache);
      console.log("trace-build: closeBundle: this.cache.has", this.cache.has("node_modules/.pnpm/solid-bootstrap@1.0.13_solid-js@1.6.6/node_modules/solid-bootstrap/dist/esm/Alert.js"));
      // TODO this.cache
      //console.log("trace-build: closeBundle: this.moduleIds()", this.moduleIds())
      //console.log("trace-build: writeBundle: bundle.cache", bundle.cache)
      //rollupCache = bundle.cache // write cache
      console.log("trace-build: closeBundle: time", new Date().toLocaleString("af"));
    },
    // bundle: Record<string, Chunk>
    // no bundle.cache ...
    writeBundle(_options, bundle) { console.log("trace-build: Object.keys(bundle)", Object.keys(bundle).slice(0, 10)); },
    //resolveId() { console.log("trace-build: resolveId"); },
    //load() { console.log("trace-build: load"); },
    //transform() { console.log("trace-build: transform"); },
    enforce: 'post',
    apply: 'build',
    /*
    writeBundle(_options, bundle) {
      console.log("writeBundle: bundle.cache", bundle.cache)
      rollupCache = bundle.cache // write cache
    },
    */
  }
}

export default defineConfig(({ command }) => {

//console.log("vite.config.ts: command", command)
const isDev = (
  process.env.__DEV__ === "true" ||
  command === "serve"
);
//console.log("vite.config.ts: isDev", isDev)
const isProd = !isDev;

// based on node_modules/rollup/dist/es/rollup.js
// use '+' as escape char to fix web extensions.
// chrome error: Filenames starting with "_" are reserved for use by the system.
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F_]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;
function sanitizeFileName(name) {
  const match = DRIVE_LETTER_REGEX.exec(name);
  const driveLetter = match ? match[0] : '';
  const name2 = driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '+');
  console.log(`sanitizeFileName: name2`, name2)
  return name2
}

let rollupCache

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
    traceBuild(),
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
    //config.build.watch
    //watch: true, // passed via CLI
    watch: {
      // https://rollupjs.org/guide/en/#watch-options
    },
    outDir,
    //emptyOutDir: false, // keep old files. this is no caching
    // true -> 15 seconds
    // false -> 15 seconds
    sourcemap: isDev ? 'inline' : false,
    // default -> 20 seconds
    // false -> 15 seconds
    minify: isProd,
    rollupOptions: {
      cache: rollupCache, // read cache
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
        sanitizeFileName,
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
      //'solid-js', // The entry point "solid-js" cannot be marked as external
      'sval', // SyntaxError: The requested module 'sval.js' does not provide an export named 'default'
      'acorn',
      "@hope-ui/solid",
      "bootstrap",
      "solid-bootstrap",
    ],
  },
};

});
