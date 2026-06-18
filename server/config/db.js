// server/config/db.js
// NOTE: dns.setDefaultResultOrder("ipv4first") is called in index.js BEFORE
// this module is imported, so it is already active when mongoose connects.
import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

/**
 * Attempt to connect to MongoDB Atlas with automatic retry.
 * - Uses mongodb+srv:// (SRV) URI — Atlas requires it for replica-set discovery.
 * - IPv4 is already enforced by the dns call in index.js.
 * - `family: 4` passed directly to the driver as a belt-and-suspenders measure.
 */
const connectDB = async (attempt = 1) => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "❌ MONGODB_URI is not defined in .env — cannot start server."
    );
  }

  try {
    await mongoose.connect(uri, {
      // Force IPv4 at the driver level (belt-and-suspenders alongside dns setting)
      family: 4,

      // How long to wait before giving up on finding a primary
      serverSelectionTimeoutMS: 15000,

      // How long a single socket operation can take
      socketTimeoutMS: 45000,

      // Keep the connection alive on idle
      heartbeatFrequencyMS: 10000,
    });

    console.log(
      `✅ MongoDB connected: ${mongoose.connection.host} (attempt ${attempt})`
    );
  } catch (error) {
    console.error(
      `❌ MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`
    );

    if (attempt < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s…`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(attempt + 1);
    }

    // All retries exhausted — propagate so index.js can exit cleanly
    throw new Error(
      `MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`
    );
  }
};

// Warn if mongoose loses the connection after startup
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Mongoose will auto-reconnect.");
});

mongoose.connection.on("error", (err) => {
  console.error("⚠️  Mongoose connection error:", err.message);
});

export default connectDB;
