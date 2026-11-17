import mongoose from "mongoose";
import { createApp } from "./server.js";
import { PORT, corsOrigins, mongoDBURL } from "./config.js";

try {
  await mongoose.connect(mongoDBURL);
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}

const server = createApp({ corsOrigins }).listen(PORT);

server.once("listening", () => {
  console.log(`axwrld API listening on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${PORT} is already in use. Set PORT to a free port and try again.`
      : error,
  );
  process.exit(1);
});
