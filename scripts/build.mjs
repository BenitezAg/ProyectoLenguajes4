import { cp, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "esbuild";
import { loadEnvFile } from "node:process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");

try {
  loadEnvFile(path.join(root, ".env"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await mkdir(output, { recursive: true });
await cp(path.join(root, "imagenes"), path.join(output, "imagenes"), {
  recursive: true,
});

await build({
  entryPoints: [path.join(root, "src/main.jsx")],
  bundle: true,
  outfile: path.join(output, "assets/app.js"),
  assetNames: "assets/[name]-[hash]",
  jsx: "automatic",
  minify: true,
  sourcemap: true,
  target: ["es2020"],
  define: {
    "import.meta.env": JSON.stringify({
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? "",
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ?? "",
    }),
  },
  logLevel: "info",
});

const html = await readFile(path.join(root, "index.html"), "utf8");
await writeFile(
  path.join(output, "index.html"),
  html,
);
await copyFile(path.join(root, "README.md"), path.join(output, "README.md"));

console.log(`\nSitio listo en ${output}.`);
