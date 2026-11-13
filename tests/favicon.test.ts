import { test, expect, describe } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

describe("Verificación de Íconos de Andito y Despliegue en Vercel", () => {
  const rootDir = "C:/Users/cris/Desktop/RSA";
  const distDir = path.join(rootDir, "dist");
  const srcDir = path.join(rootDir, "src");

  test("1. Los íconos maestros de Andito existen en src", () => {
    const requiredFiles = [
      "favicon.ico",
      "favicon.svg",
      "favicon-16x16.png",
      "favicon-32x32.png",
      "favicon-48x48.png",
      "apple-touch-icon.png",
      "android-chrome-192x192.png",
      "android-chrome-512x512.png",
      "site.webmanifest",
      "og-image.png"
    ];

    for (const file of requiredFiles) {
      const fullPath = path.join(srcDir, file);
      expect(existsSync(fullPath)).toBe(true);
      expect(statSync(fullPath).size).toBeGreaterThan(0);
    }
  });

  test("2. dist contiene los íconos estáticos listos para Vercel", () => {
    const requiredDistFiles = [
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
      "index.html"
    ];

    for (const file of requiredDistFiles) {
      const fullPath = path.join(distDir, file);
      expect(existsSync(fullPath)).toBe(true);
      expect(statSync(fullPath).size).toBeGreaterThan(0);
    }
  });

  test("3. dist/index.html referencia a Andito como favicon y título oficial", () => {
    const html = readFileSync(path.join(distDir, "index.html"), "utf-8");

    expect(html).toContain("Red Salud Andina | Andito Asistente Virtual");
    expect(html).toContain("favicon");
    expect(html).toContain("apple-touch-icon");
    expect(html).toContain("webmanifest");
    expect(html).toContain("og:image");
    expect(html).not.toContain("Bun + React");
  });

  test("4. site.webmanifest tiene formato JSON válido y referencias de Andito", () => {
    const raw = readFileSync(path.join(distDir, "site.webmanifest"), "utf-8");
    const manifest = JSON.parse(raw);

    expect(manifest.name).toContain("Andito");
    expect(manifest.short_name).toContain("Andito");
    expect(manifest.theme_color).toBe("#179299");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  });

  test("5. vercel.json está configurado correctamente con build, output y caché", () => {
    const raw = readFileSync(path.join(rootDir, "vercel.json"), "utf-8");
    const config = JSON.parse(raw);

    expect(config.buildCommand).toBe("bun run build");
    expect(config.outputDirectory).toBe("dist");
    expect(config.cleanUrls).toBe(true);
    expect(Array.isArray(config.rewrites)).toBe(true);
    expect(Array.isArray(config.headers)).toBe(true);
  });
});
