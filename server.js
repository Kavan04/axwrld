import cors from "cors";
import express from "express";
import recipeRoute from "./routes/recipeRoute.js";

export function createApp({ corsOrigins = [] } = {}) {
  const app = express();

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/recipes", recipeRoute);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  // Express recognises error handlers by their four parameters.
  app.use((error, _req, res, _next) => {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Request body is not valid JSON." });
    }
    // Other client errors raised by the body parser (too large, bad encoding, ...).
    if (error.status >= 400 && error.status < 500) {
      return res.status(error.status).json({ error: error.expose ? error.message : "Bad request." });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong on the server." });
  });

  return app;
}
