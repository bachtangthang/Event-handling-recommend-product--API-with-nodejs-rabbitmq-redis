const { Event_historiesModel } = require("./Event_historiesModel");
const { ProductModel } = require("./ProductModel");
const { UsersModel } = require("./UsersModel");

const productModel = new ProductModel(
  "products",
  "id",
  ["id", "product_name"],
  "id"
);

const usersModel = new UsersModel(
  "users",
  "uid",
  ["uid", "created_at", "updated_at"],
  "uid"
);

const event_historiesModel = new Event_historiesModel(
  "event_histories",
  "uid",
  ["event", "uid", "productsid"],
  "uid"
);

module.exports = { productModel, usersModel, event_historiesModel };
