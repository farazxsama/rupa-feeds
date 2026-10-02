// Builds a self-contained static preview (index.html + app.js + app.css)
// from the SAME components the Next.js app uses.
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "preview-dist");
mkdirSync(out, { recursive: true });

await build({
  entryPoints: [path.join(root, "preview/entry.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  outfile: path.join(out, "app.js"),
  alias: { "next/dynamic": path.join(root, "preview/dynamic-shim.tsx"), "@": path.join(root, "src") },
  loader: { ".css": "empty" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
  logOverride: { "unsupported-directive": "silent" },
});
execSync(`npx tailwindcss -i src/app/globals.css -o ${path.join(out, "app.css")} --minify`, { cwd: root, stdio: "inherit" });
copyFileSync(path.join(root, "preview/index.html"), path.join(out, "index.html"));
console.log("preview built →", out);
