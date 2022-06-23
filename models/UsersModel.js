const client = require("../db");
const { CRUDModel } = require("./Model");
class UsersModel extends CRUDModel {
  constructor(table, tablePrimaryKey, default_columns, default_sort) {
    // this.table = table;
    // this.tablePrimaryKey = tablePrimaryKey;
    // this.default_columns = default_columns;
    // this.default_sort = default_sort;
    super(table, tablePrimaryKey, default_columns, default_sort);
  }
  async create(uid, portal_id) {
    let queries = `insert into users (uid, portal_id) values ($1, $2) returning *`;
    return await (
      await client.query(queries, [uid, portal_id])
    ).rows;
  }
}

module.exports = { UsersModel };
