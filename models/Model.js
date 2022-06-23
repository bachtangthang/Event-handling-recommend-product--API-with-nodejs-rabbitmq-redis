const client = require("../db");
const { queriesParser } = require("../helpers/queriesParser");

class CRUDModel {
  constructor(table, tablePrimaryKey, default_columns, default_sort) {
    this.table = table;
    this.tablePrimaryKey = tablePrimaryKey;
    this.default_columns = default_columns;
    this.default_sort = default_sort;
  }

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

    let query = `insert into ${this.table} ( ${columns} ) values ( ${valueParameter} ) returning *`;
    // console.log(query);
    return (await client.query(query, args)).rows;
  }

  async update(id, payload) {
    let args = [];
    let parameter = [];
    console.log(id);
    //Object.keys(payload).key => columns.push(key); args.push(payload[key])
    Object.keys(payload).forEach((key, index) => {
      args.push(payload[key]);
      parameter.push(`${key} = $${index + 1}`);
    });
    let idStr = `${Object.keys(payload).length + 1}`;
    parameter = parameter.join(`, `);

    // console.log("args: ", args);

    let query = `Update ${this.table} Set ${parameter} Where ${this.tablePrimaryKey} = $${idStr} returning *`;
    console.log(query);
    console.log([...args, id]);
    return (await client.query(query, [...args, id])).rows;
  }

  async delete(id) {
    //status = 3 removed
    return (
      await client.query(
        `update ${this.table} set status = 3 Where ${this.tablePrimaryKey} = $1`,
        [id]
      )
    ).rows;
  }

  async get(filters, limit, offset, sort_by, sort, columns) {
    limit = limit || 10;
    offset = offset || 0;
    sort = sort || "desc";
    sort_by = sort_by || default_sort;

    columns = columns || default_columns;
    const colQuery = columns || default_columns.join(", ");
    const sortQuery = `order by ${sort_by} ${sort} `;

    const pageQuery = `offset ${offset} fetch next ${limit} rows only `;
    let { query, arg } = queriesParser(filters);
    query = query ? `and ${query}` : ` `;
    // console.log(query);
    // console.log(arg);
    let queryStr = `
        Select ${colQuery} From ${this.table} Where status != 3 ${query} ${sortQuery} ${pageQuery} 
      `;

    //console.log(queryStr);
    return (await client.query(queryStr, arg)).rows;
  }

  async getDetail(id, columns) {
    columns = columns || this.default_columns;
    //console.log(columns);
    return (
      await client.query(
        `Select ${columns} From ${this.table} Where ${this.tablePrimaryKey} = $1`,
        [id]
      )
    ).rows; //return requested column
  }
}

module.exports = { CRUDModel };
