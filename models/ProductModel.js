const { CRUDModel } = require("./Model");
class ProductModel extends CRUDModel {
  constructor(table, tablePrimaryKey, default_columns, default_sort) {
    // this.table = table;
    // this.tablePrimaryKey = tablePrimaryKey;
    // this.default_columns = default_columns;
    // this.default_sort = default_sort;
    super(table, tablePrimaryKey, default_columns, default_sort);
  }
}

module.exports = { ProductModel };
