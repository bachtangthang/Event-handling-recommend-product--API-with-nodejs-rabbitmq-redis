const { EventHistoryModel } = require("./EventHistoryModel");
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

const eventHistoryModel = new EventHistoryModel(
  "event_histories",
  "uid",
  ["event", "uid", "productsid"],
  "uid"
);

module.exports = { productModel, usersModel, eventHistoryModel };
