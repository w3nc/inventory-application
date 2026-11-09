// Turns the raw form fields into clean values, and says what is wrong.
const money = require("../utils/money");

// A drawer only needs a name. The note is optional.
function parseDrawerForm(body) {
  const name = (body.name || "").trim();
  const note = (body.note || "").trim();
  const errors = {};

  if (!name) errors.name = "Give the drawer a name.";
  if (name.length > 60) errors.name = "Keep the name under 60 letters.";

  return { values: { name, note }, errors, ok: Object.keys(errors).length === 0 };
}

// A card needs a title, an artist and a drawer. The rest can be blank.
function parseRecordForm(body) {
  const values = {
    title: (body.title || "").trim(),
    artist: (body.artist || "").trim(),
    release_year: (body.release_year || "").trim(),
    shelf: (body.shelf || "").trim(),
    qty: (body.qty || "").trim(),
    price: money.parsePesos(body.price),
    drawer_id: body.drawer_id ? Number(body.drawer_id) : null
  };
  const errors = {};

  if (!values.title) errors.title = "Every card needs a title.";
  if (!values.artist) errors.artist = "Who made it? Add the artist.";

  const year = values.release_year === "" ? null : Number(values.release_year);
  if (values.release_year !== "" && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
    errors.release_year = "Put a year like 1976, or leave it blank.";
  }

  const qty = values.qty === "" ? 0 : Number(values.qty);
  if (!Number.isInteger(qty) || qty < 0) {
    errors.qty = "Quantity must be a whole number, 0 or more.";
  }

  if (values.price === null) {
    errors.price = "Put a price in pesos, like 1850 or 1850.50.";
  }

  if (values.drawer_id !== null && !Number.isInteger(values.drawer_id)) {
    errors.drawer_id = "Pick a drawer from the list.";
  }

  return {
    values: {
      title: values.title,
      artist: values.artist,
      release_year: year,
      shelf: values.shelf || null,
      qty,
      price_cents: values.price,
      drawer_id: values.drawer_id,
      price: body.price
    },
    errors,
    ok: Object.keys(errors).length === 0
  };
}

module.exports = { parseDrawerForm, parseRecordForm };
