const client = require("../db");
const { CRUDModel } = require("./Model");
const { deepEqual } = require("../helpers/deepEquality");
class ProductModel extends CRUDModel {
  constructor(table, tablePrimaryKey, default_columns, default_sort) {
    // this.table = table;
    // this.tablePrimaryKey = tablePrimaryKey;
    // this.default_columns = default_columns;
    // this.default_sort = default_sort;
    super(table, tablePrimaryKey, default_columns, default_sort);
  }
  async upsertMany(products) {
    console.log(products);
    let returnProducts = [];
    for (let product of products) {
      let queriedProduct = await client.query(
        `select * from products where product_id = $1`,
        [product.product_id]
      );

      console.log("queriedProduct", queriedProduct.rows);
      if (!queriedProduct.rows[0]) {
        returnProducts.push(await this.create(product));
      } else {
        let { id, created_at, updated_at, ...queriedProductCopy } =
          queriedProduct.rows[0];
        let condition = deepEqual(product, queriedProductCopy);
        console.log("product", product);
        console.log("queriedProductCopy", queriedProductCopy);
        console.log("condition", condition);
        if (!condition) {
          let updatedProduct = await this.update(
            queriedProduct.rows[0].id,
            product
          );
          console.log(updatedProduct);
          returnProducts.push(updatedProduct[0]);
        } else {
        }
      }
    }
    console.log("returnProduct: ", returnProducts);
    return returnProducts;
  }
  async checkExist(product_id) {
    //Nguyen kim product_Id
    let query = `select exists(select 1 from ${this.table} where product_id = $1)`;
    console.log(product_id);
    return (await client.query(query, [product_id])).rows;
  }
}

module.exports = { ProductModel };
