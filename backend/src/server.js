// This file is the entry point for local development and for traditional
// (non-serverless) hosting such as Render or Railway — run with `npm run dev`
// or `npm start`. On Vercel, this file is NOT used: Vercel imports
// `src/app.js` directly as a serverless function and never calls `.listen()`.
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`CareerFlow API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();