// server/config/firebaseAdmin.js
// env is already loaded by index.js before this module is imported.
import admin from "firebase-admin";

const requiredEnv = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(
      `❌ Missing required environment variable: ${key}. Check your .env file.`
    );
  }
}

// Guard against accidental double-initialisation (e.g. hot-reload in dev)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      // .env stores escaped newlines (\n) — convert them to real newlines
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  console.log("✅ Firebase Admin initialised");
}

export default admin;
