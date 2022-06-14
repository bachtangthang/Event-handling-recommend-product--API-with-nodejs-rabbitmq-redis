const { ProductModel } = require("./ProductModel");

const productModel = new ProductModel(
  "product",
  "product_id",
  ["product_id", "product_name", "qty"],
  "product_id"
);

module.exports = { productModel };
