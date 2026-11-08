/* eslint-disable */
/**
 * Migration for #4338 — replace case-sensitive unique indexes on User.username
 * and User.email with a single case-insensitive unique index each.
 *
 * Why this is needed
 * ------------------
 * Older schemas declared `unique: true` on the fields (case-sensitive unique
 * indexes named username_1 / email_1) AND also called schema.index() with a
 * collation (non-unique). That produced Mongoose duplicate-index warnings and
 * left case-insensitive uniqueness enforced only in application code.
 *
 * The User model now defines a single unique+collation index per field. Existing
 * databases still have the old case-sensitive indexes, so those must be dropped
 * before the new ones can be built under the same names.
 *
 * Before running
 * --------------
 * 1. Resolve any case-insensitive duplicate usernames/emails (this script reports
 *    them and aborts if any remain — use emailConsolidation.js / manual cleanup).
 * 2. Point MONGO_URL at the target database (.env / .env.production).
 *
 * How to run (development)
 * ------------------------
 *   node -r @babel/register server/migrations/fixUserCaseInsensitiveUniqueIndexes.js
 *
 * How to run (production — via start.js pattern)
 * ----------------------------------------------
 * Temporarily require this file from server/migrations/start.js, then:
 *   node server/migrations/start.js
 *
 * Manual alternative (mongosh)
 * ----------------------------
 *   db.users.dropIndex('username_1')
 *   db.users.dropIndex('email_1')
 * Then restart the app so Mongoose creates the new unique+collation indexes, or:
 *   db.users.createIndex({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })
 *   db.users.createIndex({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })
 */
require('../../loadEnv')();

const mongoose = require('mongoose');

const COLLATION = { locale: 'en', strength: 2 };
const INDEX_KEYS = ['username', 'email'];

async function findCaseInsensitiveDuplicates(collection, field) {
  return collection
    .aggregate([
      { $match: { [field]: { $exists: true, $nin: [null, ''] } } },
      {
        $group: {
          _id: { $toLower: `$${field}` },
          count: { $sum: 1 },
          values: { $addToSet: `$${field}` },
          ids: { $push: '$_id' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ])
    .toArray();
}

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('MONGO_URL is not set.');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  mongoose.set('strictQuery', true);

  const collection = mongoose.connection.collection('users');

  for (const field of INDEX_KEYS) {
    const duplicates = await findCaseInsensitiveDuplicates(collection, field);
    if (duplicates.length > 0) {
      console.error(
        `Found case-insensitive duplicate ${field} values. Clean these up before migrating:`
      );
      duplicates.forEach((dup) => {
        console.error(
          `  ${field}=${JSON.stringify(dup.values)} ids=${dup.ids
            .map(String)
            .join(', ')}`
        );
      });
      process.exit(1);
    }
  }

  const existing = await collection.indexes();
  for (const field of INDEX_KEYS) {
    const name = `${field}_1`;
    const index = existing.find((idx) => idx.name === name);
    if (!index) {
      console.log(`Index ${name} not present; skipping drop.`);
      continue;
    }

    const isDesired =
      index.unique === true &&
      index.collation &&
      index.collation.locale === COLLATION.locale &&
      index.collation.strength === COLLATION.strength;

    if (isDesired) {
      console.log(
        `Index ${name} already has unique + collation; leaving as-is.`
      );
      continue;
    }

    console.log(`Dropping old index ${name}…`);
    await collection.dropIndex(name);
  }

  for (const field of INDEX_KEYS) {
    console.log(
      `Ensuring unique case-insensitive index on ${field}…`
    );
    await collection.createIndex(
      { [field]: 1 },
      { unique: true, collation: COLLATION }
    );
  }

  const after = await collection.indexes();
  console.log(
    'Current users indexes:',
    after.map((idx) => ({
      name: idx.name,
      key: idx.key,
      unique: idx.unique,
      collation: idx.collation
    }))
  );

  console.log('Done.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (disconnectErr) {
    // ignore
  }
  process.exit(1);
});
