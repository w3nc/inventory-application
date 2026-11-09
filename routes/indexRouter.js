// The front page: pick a drawer, then read its cards.
const { Router } = require("express");
const drawerController = require("../controllers/drawerController");

const router = Router();

router.get("/", drawerController.getHome);

module.exports = router;
