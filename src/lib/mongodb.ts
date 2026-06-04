import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const globalForMongoose = globalThis as unknown as { conn: Promise<typeof mongoose> | null };

export const db: Promise<typeof mongoose> =
  globalForMongoose.conn ||
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForMongoose.conn = db;
}
