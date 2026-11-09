const drawers = require("../models/drawers");
const { parseDrawerForm } = require("../validators/forms");

// Front page: every drawer as a tab, with the cards of the first one showing.
async function getHome(req, res) {
  const all = await drawers.getAllDrawers();
  const unfiled = await drawers.getUnfiledRecords();

  const activeId = req.query.drawer ? Number(req.query.drawer) : all[0] ? all[0].id : null;
  const active = activeId ? await drawers.getDrawerWithRecords(activeId) : null;

  res.render("index", {
    title: "Pick a drawer",
    drawers: all,
    activeId: active ? active.drawer.id : null,
    activeRecords: active ? active.records : [],
    unfiled
  });
}

async function getNewDrawerForm(req, res) {
  res.render("drawer-form", {
    title: "New drawer",
    heading: "Add a drawer",
    action: "/drawers/new",
    values: { name: "", note: "" },
    errors: {}
  });
}

async function postNewDrawer(req, res, next) {
  const check = parseDrawerForm(req.body);

  if (!check.ok) {
    return res.status(400).render("drawer-form", {
      title: "New drawer",
      heading: "Add a drawer",
      action: "/drawers/new",
      values: check.values,
      errors: check.errors
    });
  }

  try {
    const id = await drawers.createDrawer(check.values);
    res.redirect(`/?drawer=${id}`);
  } catch (err) {
    // The database says a drawer name must be unique.
    if (err.code === "23505") {
      return res.status(400).render("drawer-form", {
        title: "New drawer",
        heading: "Add a drawer",
        action: "/drawers/new",
        values: check.values,
        errors: { name: "There is already a drawer with that name." }
      });
    }
    next(err);
  }
}

async function getEditDrawerForm(req, res) {
  const drawer = await drawers.getDrawerById(Number(req.params.id));
  if (!drawer) {
    return res.status(404).render("error", {
      title: "Not found",
      status: 404,
      message: "That drawer is not in the cellar.",
      isAdmin: res.locals.isAdmin
    });
  }

  res.render("drawer-form", {
    title: `Edit ${drawer.name}`,
    heading: `Edit “${drawer.name}”`,
    action: `/drawers/${drawer.id}/edit`,
    values: { name: drawer.name, note: drawer.note || "" },
    errors: {}
  });
}

async function postEditDrawer(req, res, next) {
  const id = Number(req.params.id);
  const check = parseDrawerForm(req.body);

  if (!check.ok) {
    return res.status(400).render("drawer-form", {
      title: "Edit drawer",
      heading: "Edit drawer",
      action: `/drawers/${id}/edit`,
      values: check.values,
      errors: check.errors
    });
  }

  try {
    await drawers.updateDrawer(id, check.values);
    res.redirect(`/?drawer=${id}`);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).render("drawer-form", {
        title: "Edit drawer",
        heading: "Edit drawer",
        action: `/drawers/${id}/edit`,
        values: check.values,
        errors: { name: "There is already a drawer with that name." }
      });
    }
    next(err);
  }
}

// Ask before deleting, and say plainly what will happen to the cards inside.
async function getDeleteDrawer(req, res) {
  const drawer = await drawers.getDrawerById(Number(req.params.id));
  if (!drawer) {
    return res.status(404).render("error", {
      title: "Not found",
      status: 404,
      message: "That drawer is not in the cellar.",
      isAdmin: res.locals.isAdmin
    });
  }

  const inside = await drawers.getDrawerWithRecords(drawer.id);

  res.render("confirm-delete", {
    title: `Delete ${drawer.name}`,
    heading: `Delete “${drawer.name}”?`,
    action: `/drawers/${drawer.id}/delete`,
    warning: `The ${inside.records.length} card${
      inside.records.length === 1 ? "" : "s"
    } in this drawer will move to “Unfiled”. Nothing is thrown away.`
  });
}

async function postDeleteDrawer(req, res, next) {
  try {
    await drawers.deleteDrawer(Number(req.params.id));
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHome,
  getNewDrawerForm,
  postNewDrawer,
  getEditDrawerForm,
  postEditDrawer,
  getDeleteDrawer,
  postDeleteDrawer
};
