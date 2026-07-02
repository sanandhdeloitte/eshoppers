const { MongoClient } = require('mongodb');

let client;
let db;
async function connectToDatabase() {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'myshop';

  if (!uri) {
    throw new Error('Missing MONGODB_URI in .env');
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  console.log(`MongoDB connected to database: ${dbName}`);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected yet');
  }
  return db;
}

module.exports = { connectToDatabase, getDb };
