// Local MongoDB for development, using the mongod binary that mongodb-memory-server downloads.
// Data is kept in .mongo-data/ so recipes survive restarts. Stop it with Ctrl+C.
import { mkdirSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const port = Number(process.env.MONGO_PORT) || 27017;
const dbPath = new URL("../.mongo-data/", import.meta.url).pathname;
mkdirSync(dbPath, { recursive: true });

const server = await MongoMemoryServer.create({
  instance: { port, dbPath, storageEngine: "wiredTiger" },
});

console.log(`MongoDB running. In another terminal run:\n  export MONGODB_URL="${server.getUri("axwrld")}"`);

const stop = async () => {
  await server.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
