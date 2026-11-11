import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `Royal Palace Chapel Assemblies of God API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  await prisma.$disconnect();
  process.exit(0);
}

function handleSignal(signal: string): void {
  void shutdown(signal).catch((error: unknown) => {
    console.error("Graceful shutdown failed:", error);
    process.exit(1);
  });
}

process.on("SIGINT", () => handleSignal("SIGINT"));
process.on("SIGTERM", () => handleSignal("SIGTERM"));
