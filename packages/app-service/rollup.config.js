const typescript = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const dts = require("rollup-plugin-dts").default;

const compilerOptions = {
  target: "esnext",
  removeComments: true,
  module: "esnext",
  experimentalDecorators: true,
  declaration: false
};

function createConfig (input, dir = "dist") {
  return [
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
        nodeResolve(),
        commonjs(),
        typescript({
          outDir: dir,
          compilerOptions,
        }),
      ],
    },
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
  ];
}

module.exports = [
  ...createConfig("./src/index.ts"),
  ...createConfig("./src/cloud-sdk/index.ts", "dist/cloud-sdk"),
];