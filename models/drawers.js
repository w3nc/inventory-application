// Every database query about drawers (the categories) lives here.
const { pool } = require("../db/pool");

// All drawers in shelf order, each with the number of cards filed inside it.
async function getAllDrawers() {
  const result = await pool.query(`
    SELECT d.id, d.name, d.note, d.position, d.created_at,
           COUNT(r.id)::int AS card_count,
           COALESCE(SUM(r.qty), 0)::int AS total_qty
    FROM drawers d
    LEFT JOIN records r ON r.drawer_id = d.id
    GROUP BY d.id
    ORDER BY d.position, d.name
  `);
  return result.rows;
}

async function getDrawerById(id) {
  const result = await pool.query(
    `SELECT id, name, note, position, created_at FROM drawers WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// One drawer, plus every card filed in it.
async function getDrawerWithRecords(id) {
  const drawer = await getDrawerById(id);
  if (!drawer) return null;

  const cards = await pool.query(
    `SELECT id, title, artist, release_year, shelf, qty, price_cents
     FROM records
     WHERE drawer_id = $1
     ORDER BY title`,
    [id]
  );

  return { drawer, records: cards.rows };
}

// Cards with no drawer, or whose drawer was deleted.
async function getUnfiledRecords() {
  const result = await pool.query(
    `SELECT id, title, artist, release_year, shelf, qty, price_cents
     FROM records
     WHERE drawer_id IS NULL
     ORDER BY title`
  );
  return result.rows;
}

async function createDrawer({ name, note }) {
  const result = await pool.query(
    `INSERT INTO drawers (name, note, position)
     VALUES ($1, $2, (SELECT COALESCE(MAX(position), 0) + 1 FROM drawers))
     RETURNING id`,
    [name, note || null]
  );
  return result.rows[0].id;
}

async function updateDrawer(id, { name, note }) {
  await pool.query(
    `UPDATE drawers SET name = $2, note = $3 WHERE id = $1`,
    [id, name, note || null]
  );
}

// Deleting a drawer is safe: the cards inside are only unfiled, never removed.
async function deleteDrawer(id) {
  const cards = await pool.query(
    `SELECT COUNT(*)::int AS total FROM records WHERE drawer_id = $1`,
    [id]
  );
  await pool.query(`DELETE FROM drawers WHERE id = $1`, [id]);
  return cards.rows[0].total;
}

module.exports = {
  getAllDrawers,
  getDrawerById,
  getDrawerWithRecords,
  getUnfiledRecords,
  createDrawer,
  updateDrawer,
  deleteDrawer
};
