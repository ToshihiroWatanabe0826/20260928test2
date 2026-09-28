import { app } from "./app.js";
import { parseServerPort } from "./server-port.js";

const configuredPort = parseServerPort(process.env.PORT);

const server = app.listen(configuredPort, "127.0.0.1", () => {
  const address = server.address();
  if (address && typeof address === "object") {
    console.log(`Workshop starter: http://127.0.0.1:${address.port}/`);
    console.log("IT portal: knowledge, announcements, troubleshooting and email drafts.");
  }
});

server.on("error", (error: Error) => {
  console.error("Could not start the workshop starter:", error.message);
  process.exitCode = 1;
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => {
      process.exitCode = 0;
    });
  });
}
