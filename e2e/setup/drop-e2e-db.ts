import mongoose from 'mongoose';

/**
 * Drops the e2e database so every run starts from a clean slate.
 * MONGO_URL comes from .env.e2e
 */
export async function dropE2eDatabase() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('MONGO_URL is not set');
  }

  // Safety guard: never drop anything that isn't explicitly an e2e database.
  // Protects against a shell MONGO_URL (which overrides .env.e2e) pointing at
  // a dev or production database.
  const dbName = new URL(mongoUrl).pathname.replace(/^\//, '');
  if (!dbName.endsWith('-e2e')) {
    throw new Error(
      `Refusing to drop database "${dbName}": e2e databases must be named ` +
        '"<name>-e2e" (check MONGO_URL in .env.e2e or your shell environment).'
    );
  }

  const connection = await mongoose.createConnection(mongoUrl).asPromise();
  await connection.dropDatabase();
  await connection.close();
  console.log(`[e2e global-setup] dropped database "${dbName}"`);
}
