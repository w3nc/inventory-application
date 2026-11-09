const records = require("../models/records");
const drawers = require("../models/drawers");
const { parseRecordForm } = require("../validators/forms");
const money = require("../utils/money");

async function getNewRecordForm(req, res) {
  const all = await drawers.getAllDrawers();

  res.render("record-form", {
    title: "New card",
    heading: "Add a card",
    action: "/records/new",
    drawers: all,
    values: {
      title: "",
      artist: "",
      release_year: "",
      shelf: "",
      qty: "1",
      price: "",
      drawer_id: req.query.drawer || (all[0] ? all[0].id : "")
    },
    errors: {}
  });
}

async function postNewRecord(req, res, next) {
  const check = parseRecordForm(req.body);

  if (!check.ok) {
    const all = await drawers.getAllDrawers();
    return res.status(400).render("record-form", {
      title: "New card",
      heading: "Add a card",
      action: "/records/new",
      drawers: all,
      values: { ...check.values },
      errors: check.errors
    });
  }

  try {
    const id = await records.createRecord(check.values);
    res.redirect(`/records/${id}`);
  } catch (err) {
    next(err);
  }
}

async function getRecord(req, res) {
  const card = await records.getRecordById(Number(req.params.id));
  if (!card) {
    return res.status(404).render("error", {
      title: "Not found",
      status: 404,
      message: "That card is not in the ledger.",
      isAdmin: res.locals.isAdmin
    });
  }

  res.render("record", {
    title: card.title,
    record: card,
    price: money.formatPesos(card.price_cents),
    isEmpty: card.qty === 0,
    isLow: card.qty > 0 && card.qty <= 2
  });
}

async function getEditRecordForm(req, res) {
  const card = await records.getRecordById(Number(req.params.id));
  if (!card) {
    return res.status(404).render("error", {
      title: "Not found",
      status: 404,
      message: "That card is not in the ledger.",
      isAdmin: res.locals.isAdmin
    });
  }

  const all = await drawers.getAllDrawers();

  res.render("record-form", {
    title: `Edit ${card.title}`,
    heading: `Edit “${card.title}”`,
    action: `/records/${card.id}/edit`,
    drawers: all,
    values: {
      title: card.title,
      artist: card.artist,
      release_year: card.release_year || "",
      shelf: card.shelf || "",
      qty: String(card.qty),
      price: money.pesosInputValue(card.price_cents),
      drawer_id: card.drawer_id || ""
    },
    errors: {}
  });
}

async function postEditRecord(req, res, next) {
  const id = Number(req.params.id);
  const check = parseRecordForm(req.body);

  if (!check.ok) {
    const all = await drawers.getAllDrawers();
    return res.status(400).render("record-form", {
      title: "Edit card",
      heading: "Edit card",
      action: `/records/${id}/edit`,
      drawers: all,
      values: { ...check.values },
      errors: check.errors
    });
  }

  try {
    await records.updateRecord(id, check.values);
    res.redirect(`/records/${id}`);
  } catch (err) {
    next(err);
  }
}

async function getDeleteRecord(req, res) {
  const card = await records.getRecordById(Number(req.params.id));
  if (!card) {
    return res.status(404).render("error", {
      title: "Not found",
      status: 404,
      message: "That card is not in the ledger.",
      isAdmin: res.locals.isAdmin
    });
  }

  res.render("confirm-delete", {
    title: `Delete ${card.title}`,
    heading: `Delete “${card.title}”?`,
    action: `/records/${card.id}/delete`,
    warning: `This card and its ${card.qty} copies on the shelf will be removed from the ledger for good.`
  });
}

async function postDeleteRecord(req, res, next) {
  const card = await records.getRecordById(Number(req.params.id));

  try {
    await records.deleteRecord(Number(req.params.id));
    // Go back to the drawer the card came from, or to the front page.
    res.redirect(card && card.drawer_id ? `/?drawer=${card.drawer_id}` : "/");
  } catch (err) {
    next(err);
  }
}

// Everything in the shop on one page, for a quick look.
async function getAllRecordsPage(req, res) {
  const all = await records.getAllRecords();

  res.render("records", {
    title: "Every card",
    records: all,
    price: money.formatPesos
  });
}

module.exports = {
  getNewRecordForm,
  postNewRecord,
  getRecord,
  getEditRecordForm,
  postEditRecord,
  getDeleteRecord,
  postDeleteRecord,
  getAllRecordsPage
};
