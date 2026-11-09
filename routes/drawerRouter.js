// All the drawer (category) routes. Writing routes need the admin password.
const { Router } = require("express");
const controller = require("../controllers/drawerController");
const { requireAdmin } = require("../middleware/admin");

const router = Router();

router.get("/new", requireAdmin, controller.getNewDrawerForm);
router.post("/new", requireAdmin, controller.postNewDrawer);
router.get("/:id/edit", requireAdmin, controller.getEditDrawerForm);
router.post("/:id/edit", requireAdmin, controller.postEditDrawer);
router.get("/:id/delete", requireAdmin, controller.getDeleteDrawer);
router.post("/:id/delete", requireAdmin, controller.postDeleteDrawer);

module.exports = router;
