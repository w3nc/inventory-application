// Creates the two tables the shop needs, and does nothing if they already exist.
const { pool } = require("./pool");

// drawers (the categories) hold records (the items).
// Deleting a drawer never deletes a record: its drawer_id becomes NULL and the
// record shows up under "Unfiled" instead. Nothing vanishes by accident.
async function setupSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drawers (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      note       TEXT,
      position   INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      artist      TEXT NOT NULL,
      release_year INTEGER,
      shelf       TEXT,
      qty         INTEGER NOT NULL DEFAULT 0 CHECK (qty >= 0),
      price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
      drawer_id   INTEGER REFERENCES drawers(id) ON DELETE SET NULL,
      added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS records_drawer_id_idx ON records (drawer_id)
  `);
}

module.exports = { setupSchema };
