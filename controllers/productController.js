//const productModel = require("../models/productModel");
const { ProductModel } = require("../models/ProductModel");
const { productModel } = require("../models/index");
const amqp = require("amqplib/callback_api");

const RABBIT_URL = process.env.RABBIT_URL;

const RABBIT_QUEUE_NAME = "product";
const table = "product";
const tablePrimaryKey = "product_id";
const DEFAULT_COLUMNS = "product_id,product_name,qty";
const DEFAULT_SORT = "product_id";

var channel, connection;
const Redis = require("ioredis");
const redis = new Redis(6379);

amqp.connect(RABBIT_URL, function (error0, connection) {
  if (error0) {
    throw error0;
  }
  channel = connection.createChannel(function (error1, ch) {
    if (error1) {
      throw error1;
    }

    ch.assertQueue(RABBIT_QUEUE_NAME, {
      durable: false,
    });

    // setTimeout(function () {
    //   connection.close();
    //   process.exit(0);
    // }, 500);
  });
});

module.exports = {
  async getAll(req, res) {
    try {
      const { filters, limit, page, sort_by, sort, columns } = req.query;
      const offset = (page - 1) * limit;
      let filter = JSON.parse(filters);
      console.log(filter);
      const allProducts = await productModel.get(
        filter,
        limit,
        offset,
        sort_by,
        sort,
        columns
      );
      return res.status(200).json(allProducts);
    } catch (err) {
      console.log(err.message);
      res.status(500).json(err.message);
      limit;
    }
  },

  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const { columns } = req.query;
      const allProducts = await productModel.getDetail(id, columns);
      return res.status(200).json(allProducts.rows);
    } catch (err) {
      console.log(err.message);
      res.status(500);
    }
  },

  async createProduct(req, res) {
    try {
      const payload = req.body;
      const product = await productModel.create(payload);
      console.log(product[0]);
      const { product_id } = product[0];
      channel.sendToQueue(
        RABBIT_QUEUE_NAME,
        Buffer.from(JSON.stringify(product_id))
      );
      return res.status(200).json(product[0]);
    } catch (err) {
      console.log(err.message);
      res.status(500);
    }
  },

  async updateProductById(req, res) {
    try {
      const { id } = req.params;
      const payload = req.body;
      const product = await productModel.update(id, payload);
      console.log(product);
      const { product_id } = product[0];
      if (product[0] !== null) {
        channel.sendToQueue(
          RABBIT_QUEUE_NAME,
          Buffer.from(JSON.stringify(product_id))
        );
      }
      return res.status(200).json(product[0]);
    } catch (err) {
      console.log(err.message);
      res.status(500);
    }
  },

  async deleteProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.delete(id);
      return res.status(200).json(product[0]);
    } catch (err) {
      console.log(err.message);
      res.status(500);
    }
  },

  async getProductFromRedis(req, res) {
    try {
      const { id } = req.params;
      let { columns } = req.query;
      columns = columns || DEFAULT_COLUMNS;
      columns.split(",");
      let product = {};
      if ((await redis.hget(`products:${id}`, "product_id")) !== null) {
        for (col of columns.split(",")) {
          product[col] = await redis.hget(`products:${id}`, col);
        }

        //product = await redis.hmget(`products:${id}`, ...columns.split(","));
        console.log(product);

        return res.status(200).json(product);
      } else {
        const product = await productModel.getDetail(id, columns);
        console.log(product[0]);
        channel.sendToQueue(RABBIT_QUEUE_NAME, Buffer.from(JSON.stringify(id)));
        return res.status(200).json(product[0]);
      }
    } catch (err) {
      console.log(err.message);
      res.status(500);
    }
  },
};
