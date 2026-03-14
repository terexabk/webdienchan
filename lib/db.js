const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dbOpicKorea:270991@cluster0.tujpjti.mongodb.net/';
const DB_NAME = 'web_content';

let cached = global.__mongooseDb;
if (!cached) {
  cached = global.__mongooseDb = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: DB_NAME }).then(function (m) {
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
