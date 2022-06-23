const express = require("express");
const app = express();
const router = require("./route/index");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.listen(5000, () => {
  console.log("Sesrver is listening on port 5000");
});

app.use("/", router);
