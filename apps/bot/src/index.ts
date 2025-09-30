import { createCyberClient } from "./core/cyberClient";

const client = createCyberClient();

client
  .start()
  .then(() => {
    client.logger.info("CyberHub bot is up and running.");
  })
  .catch((error) => {
    console.error("Failed to start CyberHub bot", error);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  client.logger.info("Received SIGINT. Logging out...");
  await client.destroy();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  client.logger.info("Received SIGTERM. Logging out...");
  await client.destroy();
  process.exit(0);
});
