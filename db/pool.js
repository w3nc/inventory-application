// One shared connection pool for the whole app.
require("dotenv").config();

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "DATABASE_URL is missing. Fill it in the .env file inside groove-cellar/."
  );
}

// A local Postgres needs no SSL; an online host (Supabase, Render) does.
const isLocal = /(localhost|127\.0\.0\.1)/.test(connectionString || "");

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString && !isLocal ? { rejectUnauthorized: false } : false
});

module.exports = { pool, isLocal };
