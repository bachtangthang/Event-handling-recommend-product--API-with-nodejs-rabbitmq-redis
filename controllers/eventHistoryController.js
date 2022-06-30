const { eventHistoryModel } = require("../models/index");
const amqp = require("amqplib/callback_api");

const RABBIT_URL = process.env.RABBIT_URL;

const RABBIT_QUEUE_NAME = "event";
const table = "event_histores";
//const tablePrimaryKey = "product_id";
//const DEFAULT_COLUMNS = "product_id,product_name,qty";
//const DEFAULT_SORT = "product_id";

var channel, connection;
const Redis = require("ioredis");
const redis = new Redis(6379);
const { xoa_dau } = require("../helpers/xoadau");
const { readHtml, buildHtml } = require("../helpers/doT");

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
  async events(req, res) {
    try {
      const { __uid, event, products, portal_id, limit } = req.body;
      let { category } = products[0];
      category = xoa_dau(category);
      channel.sendToQueue(
        RABBIT_QUEUE_NAME,
        Buffer.from(JSON.stringify(req.body))
      );

      let keySameCategory = `portal:${portal_id}:category:${category}:mostview`;
      let keyRecentlyView = `portal:${portal_id}:user:${__uid}:mostview`;

      // pipeline for retriving productIds
      let pipeline = redis.pipeline();

      let productIds = await pipeline
        .zrevrange(keySameCategory, 0, limit - 1, "WITHSCORES")
        .zrevrange(keyRecentlyView, 0, limit - 1, "WITHSCORES")
        .exec();
      console.log("productIds: ", productIds);

      let productIdSameCategory = productIds[0][1].filter(
        (_, i) => i % 2 === 0
      );
      let productViewSameCategory = productIds[0][1].filter(
        (_, i) => i % 2 === 1
      );

      let productIdRecentlyView = productIds[1][1].filter(
        (_, i) => i % 2 === 0
      );
      let productViewRecentlyView = productIds[1][1].filter(
        (_, i) => i % 2 === 1
      );

      let productIdPipeline = redis.pipeline();
      for (let productId of productIdSameCategory) {
        productIdPipeline.hgetall(`portal:${portal_id}:products:${productId}`);
      }
      for (let productId of productIdRecentlyView) {
        productIdPipeline.hgetall(`portal:${portal_id}:products:${productId}`);
      }
      let productInfoResult = await productIdPipeline.exec();
      let productInfo = [];
      for (let i = 0; i < productInfoResult.length; i++) {
        productInfo = productInfo.concat(productInfoResult[i][1]);
      }

      console.log("productInfo: ", productInfo);

      const productSameCategory = productInfo
        .slice(0, productIdSameCategory.length)
        .map((cur, index) => ({
          ...cur,
          view: productViewSameCategory[index],
        }));

      const productRecentlyView = productInfo
        .slice(productIdSameCategory.length)
        .map((cur, index) => {
          return { ...cur, view: productViewRecentlyView[index] };
        });

      console.log("productSameCategory: ", productSameCategory);
      console.log("productRecentlyView: ", productRecentlyView);

      let template = await readHtml(`./view/portal_${portal_id}.html`);

      let htmlSameCategory = buildHtml(
        template,
        productSameCategory,
        "Top product of the same category"
      );

      let htmlRecentlyView = buildHtml(
        template,
        productRecentlyView,
        "Recently view product"
      );
      console.log("html Same category: ", htmlSameCategory);
      console.log("html recently view: ", htmlRecentlyView);
      //res.writeHead(200, { "Content-Type": "application/json" });
      return res.json({ htmlSameCategory, htmlRecentlyView });
    } catch (err) {
      console.log(err);
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },
};
