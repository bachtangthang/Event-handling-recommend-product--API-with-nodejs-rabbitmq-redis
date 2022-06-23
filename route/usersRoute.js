const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/identify", usersController.identify);
module.exports = router;
