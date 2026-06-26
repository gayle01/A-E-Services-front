import { build, createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT ?? 5173);
const basePath = process.env.BASE_PATH ?? "/";

const sharedConfig = {
  base: basePath,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: rootDir,
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    outDir: path.resolve(rootDir, "dist/public"),
    emptyOutDir: true,
  },
};

const mode = process.argv[2] ?? "dev";

if (mode === "build") {
  await build({
    ...sharedConfig,
    configFile: false,
  });
} else if (mode === "preview") {
  const server = await createServer({
    ...sharedConfig,
    configFile: false,
  });
  await server.listen();
  server.printUrls();
} else {
  const server = await createServer({
    ...sharedConfig,
    configFile: false,
  });
  await server.listen();
  server.printUrls();
}
