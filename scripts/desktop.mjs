import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = join(repoRoot, "dist");
const tauriDir = join(repoRoot, "src-tauri");
const isDebug = process.argv.includes("--debug");
const host = "127.0.0.1";
const port = 1420;

function run(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: options.stdio ?? "inherit",
      shell: false,
      env: options.env ?? process.env,
    });

    child.once("error", rejectPromise);
    child.once("exit", (code, signal) => {
      if (signal) {
        rejectPromise(new Error(`${command} exited with signal ${signal}`));
        return;
      }

      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`${command} exited with code ${code}`));
    });

    return child;
  });
}

function contentType(filePath) {
  switch (extname(filePath)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".ico":
      return "image/x-icon";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function safeFilePath(requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0] || "/");
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\//, "");
  const normalized = resolve(distDir, relative);
  if (!normalized.startsWith(distDir)) {
    return null;
  }

  if (!existsSync(normalized)) {
    return join(distDir, "index.html");
  }

  const stats = statSync(normalized);
  if (stats.isDirectory()) {
    return join(normalized, "index.html");
  }

  return normalized;
}

async function main() {
  if (!existsSync(distDir)) {
    throw new Error("dist/ not found. Run npm run build first.");
  }

  await run("npm", ["run", "build"], { cwd: repoRoot });

  const server = createServer((request, response) => {
    const filePath = safeFilePath(request.url ?? "/");

    if (!filePath || !existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType(filePath) });
    response.end(readFileSync(filePath));
  });

  await new Promise((resolvePromise, rejectPromise) => {
    server.once("error", rejectPromise);
    server.listen(port, host, () => resolvePromise());
  });

  const tauriArgs = ["run"];
  if (isDebug) {
    tauriArgs.push();
  } else {
    tauriArgs.push("--release");
  }

  const tauriProcess = spawn("cargo", tauriArgs, {
    cwd: tauriDir,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  const shutdown = () => {
    tauriProcess.kill("SIGTERM");
    server.close();
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  tauriProcess.once("exit", (code, signal) => {
    server.close();
    if (signal) {
      process.exit(1);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
