import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { join } from "path";
import copy from "rollup-plugin-copy";
import metablock from "rollup-plugin-userscript-metablock";

const isProd = process.env.BUILD === "production";

const target = process.env.TARGET;

const sourceDir = join("src", target);
const distDir = "dist";

const banner = `/*		
 THIS IS A GENERATED/BUNDLED FILE BY ROLLUP		
 if you want to view the source visit the plugins github repository		
 */		
 `;

export default {
  input: join(sourceDir, "index.ts"),
  output: {
    file: join(distDir, `${target}.js`),
    sourcemap: "inline",
    sourcemapExcludeSources: isProd,
    format: "cjs",
    banner,
  },
  external: ["mx-user-script"],
  plugins: [
    typescript(),
    nodeResolve({ browser: true }),
    commonjs(),
    metablock({ file: join(sourceDir, "meta.json") }),
    copy({
      targets: [
        {
          src: join(sourceDir, "styles.css"),
          dest: distDir,
          rename: `${target}.css`,
        },
      ],
    }),
  ],
};
