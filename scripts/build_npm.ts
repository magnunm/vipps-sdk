import { build, emptyDir } from "@deno/dnt";

const { version } = JSON.parse(Deno.readTextFileSync("deno.json"));

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  scriptModule: false,
  shims: {
    deno: true,
  },
  compilerOptions: {
    lib: ["ESNext", "DOM"],
  },
  filterDiagnostic(diagnostic) {
    // Suppress a type error in dnt's own generated test polyfill file.
    return !diagnostic.file?.fileName.includes("_dnt.test_polyfills");
  },
  test: false,
  package: {
    // package.json properties
    name: "vipps-sdk",
    version,
    description: "Unofficial Vipps MobilePay ePayment SDK",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/magnunm/vipps-sdk.git",
    },
    bugs: {
      url: "https://github.com/magnunm/vipps-sdk/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");

    // Add type exports
    const pkgPath = "npm/package.json";
    const pkg = JSON.parse(Deno.readTextFileSync(pkgPath));
    for (const key of Object.keys(pkg.exports)) {
      pkg.exports[key] = {
        types: `./esm/${key === "." ? "mod" : key}.d.ts`,
        ...pkg.exports[key],
      };
    }
    Deno.writeTextFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  },
});
