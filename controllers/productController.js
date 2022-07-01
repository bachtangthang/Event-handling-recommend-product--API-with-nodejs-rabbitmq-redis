const { productModel } = require("../models/index");
const amqp = require("amqplib/callback_api");

const RABBIT_URL = process.env.RABBIT_URL;

const RABBIT_QUEUE_NAME = "product";
const DEFAULT_COLUMNS = "id,product_name";

var channel, connection;
const Redis = require("ioredis");
const redis = new Redis(6379);
const { xoa_dau } = require("../helpers/xoadau");
const { readHtml } = require("../helpers/doT");

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
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
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
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
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
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },

  async deleteProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.delete(id);
      return res.status(200).json(product[0]);
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
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
        console.log(product);

        return res.status(200).json(product);
      } else {
        const product = await productModel.getDetail(id, columns);
        console.log(product[0]);
        channel.sendToQueue(RABBIT_QUEUE_NAME, Buffer.from(JSON.stringify(id)));
        return res.status(200).json(product[0]);
      }
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },

  async upsertMany(req, res) {
    try {
      const upsertedProducts = await productModel.upsertMany(req.body);
      console.log(upsertedProducts);
      return res.status(200).json(upsertedProducts);
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },

  async getTopMostViewProductByCategory(req, res) {
    try {
      let category = xoa_dau(req.body.category);
      let { portal_id } = req.body;
      let records = req.body.records;

      console.log("portal_id: ", portal_id);
      let key = `portal:${portal_id}:category:${category}:mostview`;
      let productsId = await redis.zrevrange(key, 0, records - 1);
      console.log(productsId);

      return res.status(200).json(productsId);
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },

  async mostViewProductByUser(req, res) {
    try {
      const uid = req.body.__uid;
      let { portal_id, records } = req.body;
      let key = `portal:${portal_id}:user:${uid}:mostview`;
      const productsId = await redis.zrevrange(key, 0, records - 1);
      return res.status(200).json({ productsId });
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },

  async mostViewProductByCategory(req, res) {
    try {
      let category = xoa_dau(req.body.category);
      let { records, portal_id } = req.body;
      let key = `portal:${portal_id}:category:${category}:mostview`;
      let productsId = await redis.zrevrange(key, 0, records - 1);
      return res.status(200).json({ productsId });
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },

  async getHtmlTopViewProductByCategory(req, res) {
    try {
      let products = [];
      let category = xoa_dau(req.body.category);
      console.log(category);
      let { records, portal_id } = req.body;
      console.log("portal_id: ", portal_id);
      let key = `portal:${portal_id}:category:${category}:mostview`;
      console.log("key: ", key);
      let productIds = await redis.zrevrange(key, 0, records - 1);
      console.log("productIds:", productIds);

      for (let productId of productIds) {
        console.log("productId: ", productId);
        let product = await redis.hgetall(
          `portal:${portal_id}:products:${productId}`
        );
        let view = await redis.zscore(key, productId);
        product.view = view;
        products.push(product);
      }
      console.log("mang products:", products);
      let title = "Product of the same category";

      let html = await readHtml(
        `./view/portal_${portal_id}.html`,
        products,
        title
      );
      res.writeHead(200, { "Content-Type": "text/html" });
      //console.log("html: ", html);
      res.end(html);
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },

  async getHtmlViewedProduct(req, res) {
    try {
      let products = [];
      let { __uid, records, portal_id } = req.body;
      console.log(`__uid: ${__uid}, records: ${records}`);
      let key = `portal:${portal_id}:user:${__uid}`;
      console.log("key: ", key);
      let productIds = await redis.smembers(key);
      console.log("productIds:", productIds);

      for (let productId of productIds) {
        console.log("productId: ", productId);
        let product = await redis.hgetall(
          `portal:${portal_id}:products:${productId}`
        );
        let view = await redis.zscore(
          `portal:${portal_id}:user:${__uid}:mostview`,
          productId
        );
        product.view = view;
        products.unshift(product);
      }
      const sliceProducts = products.slice(0, records);
      console.log("viewed products:", products);
      let title = "recently viewed Products";

      let html = await readHtml(
        `./view/portal_${portal_id}.html`,
        products,
        title
      );
      res.writeHead(200, { "Content-Type": "text/html" });
      //console.log("html: ", html);
      res.end(html);
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },
};
