// Every database query about records (the cards) lives here.
const { pool } = require("../db/pool");

const LIST_FIELDS = `
  r.id, r.title, r.artist, r.release_year, r.shelf, r.qty, r.price_cents,
  r.drawer_id, d.name AS drawer_name
`;

async function getAllRecords() {
  const result = await pool.query(`
    SELECT ${LIST_FIELDS}
    FROM records r
    LEFT JOIN drawers d ON d.id = r.drawer_id
    ORDER BY r.title
  `);
  return result.rows;
}

async function getRecordById(id) {
  const result = await pool.query(
    `SELECT ${LIST_FIELDS}
     FROM records r
     LEFT JOIN drawers d ON d.id = r.drawer_id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// Cards that are running out, shown on the front page as a nudge.
async function getLowStockRecords(limit = 5) {
  const result = await pool.query(
    `SELECT ${LIST_FIELDS}
     FROM records r
     LEFT JOIN drawers d ON d.id = r.drawer_id
     WHERE r.qty <= 2
     ORDER BY r.qty, r.title
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function createRecord(record) {
  const result = await pool.query(
    `INSERT INTO records
       (title, artist, release_year, shelf, qty, price_cents, drawer_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      record.title,
      record.artist,
      record.release_year,
      record.shelf,
      record.qty,
      record.price_cents,
      record.drawer_id
    ]
  );
  return result.rows[0].id;
}

async function updateRecord(id, record) {
  await pool.query(
    `UPDATE records SET
       title = $2, artist = $3, release_year = $4, shelf = $5,
       qty = $6, price_cents = $7, drawer_id = $8
     WHERE id = $1`,
    [
      id,
      record.title,
      record.artist,
      record.release_year,
      record.shelf,
      record.qty,
      record.price_cents,
      record.drawer_id
    ]
  );
}

async function deleteRecord(id) {
  await pool.query(`DELETE FROM records WHERE id = $1`, [id]);
}

module.exports = {
  getAllRecords,
  getRecordById,
  getLowStockRecords,
  createRecord,
  updateRecord,
  deleteRecord
};
