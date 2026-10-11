import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing. Add it to .env.local");
}

// Next.js dev mode reloads files often. We keep the connection promise on
// globalThis so we do not open a new connection on every reload.
const globalCache = globalThis;

export function connectDB() {
  if (!globalCache.mongooseConn) {
    globalCache.mongooseConn = mongoose.connect(uri);
  }
  return globalCache.mongooseConn;
}