import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] ?? (process.env.REPL_ID ? undefined : "8081");

if (!rawPort) {
  throw new Error("PORT environment variable is required in Replit.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
