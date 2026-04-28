const fs = require("node:fs");

function safeUnlink(path) {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    if (err && (err.code === "ENOENT" || err.code === "EPERM")) return;
    throw err;
  }
}

safeUnlink("package-lock.json");
safeUnlink("yarn.lock");

const userAgent = process.env.npm_config_user_agent || "";
if (!userAgent.startsWith("pnpm/")) {
  process.stderr.write("Use pnpm instead\n");
  process.exit(1);
}

