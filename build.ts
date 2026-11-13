import tailwind from "bun-plugin-tailwind";
import { copyFile, rm } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

for (const output of result.outputs) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}

// Compilar Serverless Function para Vercel
await Bun.build({
  entrypoints: ["src/server/chat.ts"],
  outdir: "api",
  naming: "chat.js",
  target: "node",
  minify: false,
});
console.log(" Bundled serverless function: api/chat.js");

// Copiar archivos estáticos clave a la raíz de dist para despliegues perfectos en Vercel
const staticAssets = [
  "favicon.ico",
  "favicon.svg",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "site.webmanifest",
  "og-image.png",
  "Andito-avatar.png",
  "logo.svg"
];

for (const asset of staticAssets) {
  const srcPath = path.join(process.cwd(), "src", asset);
  const destPath = path.join(outdir, asset);
  try {
    await copyFile(srcPath, destPath);
    console.log(` Copied static asset to dist: ${asset}`);
  } catch {
    // Continuar si algún archivo auxiliar opcional no está presente
  }
}

// Copiar datasets, registros y logs del proyecto a la raíz de dist
const dataAssets = [
  "logs.txt",
  "logs-mensajes.csv",
  "unresolved_questions.json",
  "rsa_live_testing_results.csv",
  "rsa_test_benchmarks_and_performance.csv",
  "rsa_business_case_kpis.csv",
  "rsa_call_reasons_and_deflection.csv",
  "rsa_complaints_reduction_impact.csv",
  "rsa_hourly_demand_and_latency.csv",
  "rsa_roi_financial_projection_12m.csv"
];

for (const asset of dataAssets) {
  const srcPath = path.join(process.cwd(), asset);
  const destPath = path.join(outdir, asset);
  try {
    await copyFile(srcPath, destPath);
    console.log(` Copied data asset to dist: ${asset}`);
  } catch {
    // Continuar si algún archivo opcional no está presente
  }
}
