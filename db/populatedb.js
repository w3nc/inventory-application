// Dummy data for the shop: four drawers and a pile of records.
// Run it with: npm run populate   (it asks before wiping anything)
require("dotenv").config();
const readline = require("node:readline");
const { pool } = require("./pool");
const { setupSchema } = require("./schema");

const DRAWERS = [
  { name: "Jazz", note: "Blue notes and long players." },
  { name: "Soul", note: "Motown, Stax and slow grooves." },
  { name: "Folk", note: "Acoustic, fingerpicked, quiet." },
  { name: "Punk", note: "Loud, fast, sleeves worn thin." }
];

// drawer, title, artist, year, shelf, qty, price in pesos
const RECORDS = [
  ["Jazz", "Kind of Blue", "Miles Davis", 1959, "J-03", 3, 1850],
  ["Jazz", "A Love Supreme", "John Coltrane", 1965, "J-07", 1, 2100],
  ["Jazz", "Time Out", "Dave Brubeck", 1959, "J-11", 5, 1600],
  ["Jazz", "Bitches Brew", "Miles Davis", 1970, "J-04", 2, 2450],
  ["Jazz", "Head Hunters", "Herbie Hancock", 1973, "J-09", 4, 1900],
  ["Jazz", "Ella and Louis", "Ella Fitzgerald", 1956, "J-12", 6, 1450],
  ["Jazz", "Giant Steps", "John Coltrane", 1960, "J-08", 0, 2300],
  ["Soul", "What's Going On", "Marvin Gaye", 1971, "S-02", 2, 2200],
  ["Soul", "I Never Loved a Man", "Aretha Franklin", 1967, "S-05", 4, 1750],
  ["Soul", "Songs in the Key of Life", "Stevie Wonder", 1976, "S-01", 3, 2600],
  ["Soul", "Innervisions", "Stevie Wonder", 1973, "S-03", 1, 2050],
  ["Soul", "Green Onions", "Booker T. and the M.G.'s", 1962, "S-08", 5, 1350],
  ["Soul", "The Dock of the Bay", "Otis Redding", 1968, "S-06", 2, 1500],
  ["Folk", "Blue", "Joni Mitchell", 1971, "F-04", 3, 1950],
  ["Folk", "Bridge Over Troubled Water", "Simon and Garfunkel", 1970, "F-02", 7, 1250],
  ["Folk", "Harvest", "Neil Young", 1972, "F-07", 2, 1700],
  ["Folk", "Songs from the Wood", "Fairport Convention", 1977, "F-09", 1, 1400],
  ["Folk", "Pink Moon", "Nick Drake", 1972, "F-05", 0, 2900],
  ["Folk", "I Often Dream of Trains", "Robyn Hitchcock", 1984, "F-11", 3, 1150],
  ["Punk", "London Calling", "The Clash", 1979, "P-01", 4, 2100],
  ["Punk", "Never Mind the Bollocks", "Sex Pistols", 1977, "P-03", 2, 1800],
  ["Punk", "Ramones", "Ramones", 1976, "P-06", 5, 1650],
  ["Punk", "Damaged", "Black Flag", 1981, "P-02", 1, 2250],
  ["Punk", "Double Nickels on the Dime", "Minutemen", 1984, "P-08", 2, 1980],
  ["Punk", "The Queen Is Dead", "The Smiths", 1986, "P-10", 3, 1600],
  ["Punk", "Fresh Fruit for Rotting Vegetables", "Dead Kennedys", 1980, "P-04", 6, 1500]
];

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim().toLowerCase());
  }));
}

async function populate({ force = false } = {}) {
  await setupSchema();

  const counts = await pool.query("SELECT COUNT(*)::int AS total FROM records");
  const alreadyThere = counts.rows[0].total;

  if (alreadyThere > 0 && !force) {
    const answer = await ask(
      `There are already ${alreadyThere} cards. Wipe them and load the dummy data? (y/n) `
    );
    if (answer !== "y" && answer !== "yes") {
      console.log("Nothing changed.");
      return;
    }
  }

  await pool.query("TRUNCATE records, drawers RESTART IDENTITY CASCADE");

  const drawerIds = {};
  for (const [index, drawer] of DRAWERS.entries()) {
    const result = await pool.query(
      `INSERT INTO drawers (name, note, position) VALUES ($1, $2, $3) RETURNING id`,
      [drawer.name, drawer.note, index + 1]
    );
    drawerIds[drawer.name] = result.rows[0].id;
  }

  for (const [drawer, title, artist, year, shelf, qty, pesos] of RECORDS) {
    await pool.query(
      `INSERT INTO records
         (title, artist, release_year, shelf, qty, price_cents, drawer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [title, artist, year, shelf, qty, Math.round(pesos * 100), drawerIds[drawer]]
    );
  }

  console.log(`Loaded ${DRAWERS.length} drawers and ${RECORDS.length} cards.`);
}

module.exports = { populate };

if (require.main === module) {
  populate()
    .then(() => pool.end())
    .catch((err) => {
      console.error("Could not load the dummy data:", err.message);
      pool.end();
      process.exit(1);
    });
}
