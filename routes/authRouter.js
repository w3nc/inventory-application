// The unlock page: type the shared admin password to get edit rights.
const { Router } = require("express");
const { unlock, lock } = require("../middleware/admin");

const router = Router();

router.get("/unlock", (req, res) => {
  res.render("unlock", {
    title: "Unlock the ledger",
    next: req.query.next || "/",
    error: null
  });
});

router.post("/unlock", unlock);
router.post("/lock", lock);

module.exports = router;
