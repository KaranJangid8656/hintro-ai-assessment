import mongoose from 'mongoose';
import { db } from '../src/lib/mongodb';

beforeAll(async () => {
  await db;
});

afterAll(async () => {
  await mongoose.disconnect();
});
