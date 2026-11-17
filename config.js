// Port 5000 is avoided on purpose: macOS AirPlay Receiver listens there and answers 403.
export const PORT = Number(process.env.PORT) || 5050;

// Origins allowed to call the API from a browser (comma-separated). Defaults to the Vite dev server.
export const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const mongoDBURL = process.env.MONGODB_URL;

if (!mongoDBURL) {
  throw new Error('MONGODB_URL is not set. Export your MongoDB connection string as MONGODB_URL before starting the server.');
}
