// All the record (item) routes. Writing routes need the admin password.
const { Router } = require("express");
const controller = require("../controllers/recordController");
const { requireAdmin } = require("../middleware/admin");

const router = Router();

router.get("/", controller.getAllRecordsPage);
router.get("/new", requireAdmin, controller.getNewRecordForm);
router.post("/new", requireAdmin, controller.postNewRecord);
router.get("/:id", controller.getRecord);
router.get("/:id/edit", requireAdmin, controller.getEditRecordForm);
router.post("/:id/edit", requireAdmin, controller.postEditRecord);
router.get("/:id/delete", requireAdmin, controller.getDeleteRecord);
router.post("/:id/delete", requireAdmin, controller.postDeleteRecord);

module.exports = router;
