const typescript = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
import { terser } from "rollup-plugin-terser";
const json = require("@rollup/plugin-json");
const dts = require("rollup-plugin-dts").default;
const packageInfo = require('./package.json');
const replace = require('@rollup/plugin-replace')

const compilerOptions = {
  target: "esnext",
  removeComments: true,
  module: "esnext",
  experimentalDecorators: true,
  esModuleInterop: true,
  declaration: false,
  declarationMap: false
};

const manualChunkLists = Object.keys(packageInfo.dependencies)
const manualChunks = {}
for (let item of manualChunkLists) {
  manualChunks[item.replaceAll('/', '-')] = [item]
}

function createConfig(input, dir = "dist", splitChunks = true) {
  return [
    {
      input,
      output: {
        dir,
        format: "esm",
        entryFileNames: "index.d.ts",
      },
      plugins: [
        dts({
          include: ["src/**/*"],
        }),
      ],
    },
    {
      input,
      output: {
        dir,
        sourcemap: false,
        format: "cjs",
        entryFileNames: "index.js",
      },
      plugins: [
        json({
          namedExports: false,
        }),
        terser(),
        nodeResolve({
          preferBuiltins: false
        }),
        replace({
          'process.env.APP_SERVICE_ROOT': `"${__dirname}"`,
        }),
        commonjs(),
        typescript({
          outDir: dir,
          compilerOptions,
        })
      ],
    },
  ];
}

module.exports = [
  ...createConfig("./src/index.ts"),
  ...createConfig("./src/cloud-sdk/index.ts", "dist/cloud-sdk", false),
];