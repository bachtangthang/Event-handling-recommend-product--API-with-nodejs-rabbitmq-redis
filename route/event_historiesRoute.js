const express = require("express");
const router = express.Router();
const event_historiesController = require("../controllers/event_historiesController");

router.post("/events", event_historiesController.events);

module.exports = router;
