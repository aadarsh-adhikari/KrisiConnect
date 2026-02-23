import mongoose from "mongoose";

// determine which MongoDB URI to use depending on the environment
// - during local development you can set MONGODB_LOCAL_URI
// - in production (e.g. Vercel/Cloud) set MONGODB_URI to your cloud database
const uri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI
    : process.env.MONGODB_LOCAL_URI || process.env.MONGODB_URI;

if (!uri) {
  throw new Error("no MongoDB URI found – check your environment variables");
}

export default async function ConnectDB() {
  try {
    await mongoose.connect(uri);
    console.log(`successfully connected to ${uri}`);
  } catch (e) {
    console.error("MongoDB connection error:", e);
    throw e;
  }
}