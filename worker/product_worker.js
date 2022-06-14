const amqp = require("amqplib/callback_api");
require("dotenv").config({ path: "../.env" });
const RABBIT_URL = process.env.RABBIT_URL;
const PRODUCT_QUEUE_NAME = process.env.PRODUCT_QUEUE_NAME;
const Redis = require("ioredis");
const redis = new Redis(6379);
const { productModel } = require("../models/index");

amqp.connect(RABBIT_URL, (error, connection) => {
  connection.createChannel((err, channel) => {
    channel.assertQueue(PRODUCT_QUEUE_NAME, {
      durable: false,
    });
    console.log(`Waiting for event in ${PRODUCT_QUEUE_NAME} queue`);

    channel.consume(
      PRODUCT_QUEUE_NAME,
      async (msg) => {
        try {
          console.log("1", msg.content.toString());
          let product_id = JSON.parse(msg.content.toString());
          console.log("2", product_id);
          const product = await productModel.getDetail(product_id, " * ");
          console.log(product);
          if (product) {
            for ([key, value] of Object.entries(product[0])) {
              console.log(`${key}: ${value}`);
              redis.hset(`products:${product_id}`, key, value);
            }
          } else {
            console.log("no product with such id");
          }
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
