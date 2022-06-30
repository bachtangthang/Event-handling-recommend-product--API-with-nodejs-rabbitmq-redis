const client = require("../db");
const { CRUDModel } = require("./Model");
const Redis = require("ioredis");
const redis = new Redis(6379);
class EventHistoryModel extends CRUDModel {
  constructor(table, tablePrimaryKey, default_columns, default_sort) {
    // this.table = table;
    // this.tablePrimaryKey = tablePrimaryKey;
    // this.default_columns = default_columns;
    // this.default_sort = default_sort;
    super(table, tablePrimaryKey, default_columns, default_sort);
  }
  async create(uid, event, productId, portal_id) {
    console.log("portal_id inside model: ", portal_id);
    const query = `Insert into event_histories (uid, event, productsId, portal_id) values ($1, $2, $3, $4)`;
    await client.query(query, [uid, event, `{${productId}}`, portal_id]);
  }
}

module.exports = { EventHistoryModel };
