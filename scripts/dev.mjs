import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { context } from "esbuild";
import { loadEnvFile } from "node:process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
try {
  loadEnvFile(path.join(root, ".env"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await mkdir(output, { recursive: true });
await copyFile(path.join(root, "index.html"), path.join(output, "index.html"));

const server = await context({
  entryPoints: [path.join(root, "src/main.jsx")],
  bundle: true,
  outfile: path.join(output, "assets/app.js"),
  assetNames: "assets/[name]-[hash]",
  jsx: "automatic",
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

try {
  const { host, port } = await server.serve({
    host: "127.0.0.1",
    port: 3000,
    servedir: output,
  });
  await server.watch();
  console.log(`\nPortfolio disponible en http://${host}:${port}`);
  console.log("Esbuild recompila los cambios; pulsa Ctrl+C para terminar.");
} catch (error) {
  await server.dispose();
  throw error;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    void server.dispose().then(() => process.exit(0));
  });
}
