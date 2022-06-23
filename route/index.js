const express = require("express");
const productsRoute = require("./productRoute");
const usersRoute = require("./usersRoute");
const event_historiesRoute = require("./event_historiesRoute");

const app = express();

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,content-type,set-cookie"
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", false);

  // Pass to next layer of middleware
  next();
});

app.use("/products", productsRoute);
app.use("/users", usersRoute);
app.use("/eventHistories", event_historiesRoute);

module.exports = app;
