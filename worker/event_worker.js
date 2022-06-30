const amqp = require("amqplib/callback_api");
require("dotenv").config({ path: "../.env" });
const RABBIT_URL = process.env.RABBIT_URL;
const EVENT_QUEUE_NAME = process.env.EVENT_QUEUE_NAME;
const Redis = require("ioredis");
const redis = new Redis(6379);
const { productModel } = require("../models/index");
const { eventHistoryModel } = require("../models/index");
const { xoa_dau } = require("../helpers/xoadau");
amqp.connect(RABBIT_URL, (error, connection) => {
  connection.createChannel((err, channel) => {
    channel.assertQueue(EVENT_QUEUE_NAME, {
      durable: false,
    });
    console.log(`Waiting for event in ${EVENT_QUEUE_NAME} queue`);

    channel.consume(
      EVENT_QUEUE_NAME,
      async (msg) => {
        try {
          const pipeline = redis.pipeline();
          const payload = JSON.parse(msg.content.toString());
          const { __uid, event, portal_id, products } = payload;
          let existedProduct = null;

          for (let product of products) {
            existedProduct = await productModel.checkExist(product.product_Id);
            pipeline.zincrby(
              `portal:${portal_id}:user:${__uid}:mostview`,
              1,
              product.product_Id
            );
            let category = xoa_dau(product.category);
            pipeline.zincrby(
              `portal:${portal_id}:category:${category}:mostview`,
              1,
              product.product_Id
            );

            if (existedProduct[0].exists === false) {
              let insertedProducts = await productModel.create(product);
              pipeline.sadd(
                `portal:${portal_id}:user:${__uid}`,
                insertedProducts[0].product_id
              );

              for ([key, value] of Object.entries(insertedProducts[0])) {
                pipeline.hset(
                  `portal:${portal_id}:products:${insertedProducts[0].product_id}`,
                  key,
                  value
                );
              }

              await eventHistoryModel.create(
                __uid,
                event,
                insertedProducts[0].product_id,
                portal_id
              );
            } else {
              pipeline.sadd(
                `portal:${portal_id}:user:${__uid}`,
                product.product_Id
              );
            }
          }
          pipeline.exec();
        } catch (err) {
          console.log(err);
        }

        try {
          channel.ack(msg);
        } catch (e) {
          console.log("RabbitMQ error", e);
        }
      },
      {
        noAck: false,
      }
    );
  });
});
