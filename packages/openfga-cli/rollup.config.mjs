import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";

export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./dist/index.cjs",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve({
        extensions: [".js", ".ts"],
      }),
      swc({
        jsc: {
          minify: {
            compress: true,
            mangle: true,
          },
        },
      }),
      commonjs(),
    ],
  },
];
