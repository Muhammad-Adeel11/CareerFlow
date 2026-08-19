const mongoose = require('mongoose');

// In a serverless environment (Vercel), this module can be re-invoked on every
// request without the process restarting. We cache the connection on `global`
// so repeated invocations reuse it instead of opening a new connection each time.
let cached = global.__careerflow_mongoose;
if (!cached) {
  cached = global.__careerflow_mongoose = { conn: null, promise: null };
}

async function connectDB(uri) {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  console.log(`MongoDB connected: ${cached.conn.connection.host}`);
  return cached.conn;
}

module.exports = connectDB;