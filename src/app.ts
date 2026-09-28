import express from "express";
import { fileURLToPath } from "node:url";
import { portalContent } from "./portal.js";

export const app = express();

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/portal", (_request, response) => {
  response.set("Cache-Control", "no-store").json(portalContent);
});

app.use("/assets", express.static(
  fileURLToPath(new URL("../public", import.meta.url)),
  { index: false }
));

app.get("/", (_request, response) => {
  response.set("Cache-Control", "no-store").sendFile(
    fileURLToPath(new URL("../public/index.html", import.meta.url))
  );
});
