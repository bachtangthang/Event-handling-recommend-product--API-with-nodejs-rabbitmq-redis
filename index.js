const express = require("express");
const app = express();
const router = require("./route/productRoute");
const client = require("./db");
require("dotenv").config();

app.use(express.json());

app.listen(5000, () => {
  console.log("Sesrver is listening on port 5000");
});

app.use("/", router);
