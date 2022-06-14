const client = require("../db");
const { queriesParser } = require("../helpers/queriesParser");

const table = "product";
const tablePrimaryKey = "product_id";
const DEFAULT_COLUMNS = ["product_id", "product_name", "qty"];
const DEFAULT_SORT = "product_id";

module.exports = {
  async get(filters, limit, offset, sort_by, sort, columns) {
    limit = limit || 10;
    offset = offset || 0;
    sort = sort || "desc";
    sort_by = sort_by || DEFAULT_SORT;

    columns = columns || DEFAULT_COLUMNS;
    const colQuery = columns || DEFAULT_COLUMNS.join(", ");
    const sortQuery = `order by ${sort_by} ${sort} `;

    const pageQuery = `offset ${offset} fetch next ${limit} rows only `;
    let { query, arg } = queriesParser(filters);
    query = query ? `and ${query}` : ` `;
    // console.log(query);
    // console.log(arg);
    let queryStr = `
        Select ${colQuery} From ${table} Where status != 3 ${query} ${sortQuery} ${pageQuery}
      `;

    //console.log(queryStr);
    return await client.query(queryStr, arg);
  },

  async getDetail(id, columns) {
    columns = columns || DEFAULT_COLUMNS;
    //console.log(columns);
    return await client.query(
      `Select ${columns} From ${table} Where ${tablePrimaryKey} = $1`,
      [id]
    ); //return requested column
  },

  async update(id, payload) {
    let args = [];
    let parameter = [];
    //Object.keys(payload).key => columns.push(key); args.push(payload[key])
    Object.keys(payload).forEach((key, index) => {
      args.push(payload[key]);
      parameter.push(`${key} = $${index + 1}`);
      return index + 1;
    });
    let idStr = `${Object.keys(payload).length + 1}`;
    parameter = parameter.join(`, `);

    //console.log("args: ", args);

    let query = `Update ${table} Set ${parameter} Where ${tablePrimaryKey} = $${idStr} returning *`;
    console.log(query);
    return await client.query(query, [...args, id]);
  },

  async create(payload) {
    let columns = [];
    let args = [];
    let valueParameter = [];

    Object.keys(payload).forEach((key, index) => {
      columns.push(key);
      args.push(payload[key]);
      valueParameter.push(`$${index + 1}`);
    });
    columns = columns.join(`, `);
    valueParameter = valueParameter.join(`, `);
    // console.log("columns", columns);
    // console.log("args: ", args);
    // console.log("str: ", str);
    let query = `insert into ${table} ( ${columns} ) values ( ${valueParameter} )`;
    // console.log(query);
    return await client.query(query, args);
  },

  async delete(id) {
    //status = 3 removed
    return await client.query(
      `update ${table} set status = 3 Where ${tablePrimaryKey} = $1`,
      [id]
    );
  },
};
