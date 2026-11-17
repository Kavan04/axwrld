export const PORT = 5000;

export const mongoDBURL = process.env.MONGODB_URL;

if (!mongoDBURL) {
  throw new Error('MONGODB_URL is not set. Export your MongoDB connection string as MONGODB_URL before starting the server.');
}
