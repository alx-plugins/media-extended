const { build } = require("esbuild");
const { lessLoader } = require("esbuild-plugin-less");

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source visit the plugins github repository
*/
`;

const fs = require("fs");
const renamePlugin = {
  name: "rename-styles",
  setup: (build) => {
    build.onEnd(() => {
      const { outfile } = build.initialOptions;
      const outcss = outfile.replace(/\.js$/, ".css");
      const fixcss = outfile.replace(/main\.js$/, "styles.css");
      if (fs.existsSync(outcss)) {
        // console.log("Renaming", outcss, "to", fixcss);
        fs.renameSync(outcss, fixcss);
      }
    });
  },
};
const copyManifest = {
  name: "copy-manifest",
  setup: (build) => {
    build.onEnd(() => {
      fs.copyFileSync("manifest.json", "build/manifest.json");
    });
  },
};

const isProd = process.env.BUILD === "production";

(async () => {
  try {
    await build({
      entryPoints: ["src/mx-main.ts"],
      bundle: true,
      watch: !isProd,
      platform: "browser",
      external: ["obsidian", "https"],
      format: "cjs",
      mainFields: ["browser", "module", "main"],
      banner: { js: banner },
      sourcemap: isProd ? false : "inline",
      minify: isProd,
      define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.BUILD),
      },
      outfile: "build/main.js",
      plugins: [
        lessLoader({
          javascriptEnabled: true,
        }),
        renamePlugin,
        copyManifest,
      ],
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();