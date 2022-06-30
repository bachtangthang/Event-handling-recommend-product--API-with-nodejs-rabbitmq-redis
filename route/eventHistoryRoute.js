const express = require("express");
const router = express.Router();
const eventHistoryController = require("../controllers/eventHistoryController");

router.post("/events", eventHistoryController.events);

module.exports = router;
