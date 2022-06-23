const amqp = require("amqplib/callback_api");
require("dotenv").config({ path: "../.env" });
const RABBIT_URL = process.env.RABBIT_URL;
const EVENT_QUEUE_NAME = process.env.EVENT_QUEUE_NAME;
const Redis = require("ioredis");
const redis = new Redis(6379);
const { productModel } = require("../models/index");
const { event_historiesModel } = require("../models/index");
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
          const payload = JSON.parse(msg.content.toString());
          console.log("payload: ", payload);
          const { __uid, event, portal_id } = payload;
          console.log("portal_id inside event_worker: ", portal_id);
          let existedProduct;
          //insert to database product and redis
          for (product of payload.products) {
            console.log("product: ", product);
            existedProduct = await productModel.checkExist(product.product_Id);
            console.log(`Co ton tai product: ${existedProduct[0].exists}`);
            //save most view cua user, san pham
            await redis.zincrby(
              `portal:${portal_id}:user:${__uid}:mostview`,
              1,
              product.product_Id
            );
            //save most view cua category, san pham
            let category = xoa_dau(product.category);
            console.log(category);
            await redis.zincrby(
              `portal:${portal_id}:category:${category}:mostview`,
              1,
              product.product_Id
            );

            if (existedProduct[0].exists === false) {
              //it 's a new product!!
              console.log("it's a new product");
              let insertedProducts = await productModel.create(product);
              //add uid to redis
              await redis.sadd(
                `portal:${portal_id}:user:${__uid}`,
                insertedProducts[0].product_id
              );

              console.log("insertedProduct: ", insertedProducts[0]);
              for ([key, value] of Object.entries(insertedProducts[0])) {
                console.log(`${key}: ${value}`);
                //save product to redis
                await redis.hset(
                  `portal:${portal_id}:products:${insertedProducts[0].product_id}`,
                  key,
                  value
                );
              }
              console.log(
                "portal_id inside event_worker, before calling create event_histories: ",
                portal_id
              );
              console.log("calling create event_histories");
              await event_historiesModel.create(
                __uid,
                event,
                insertedProducts[0].product_id,
                portal_id
              );
              //existedProduct = true;
            } else {
              await redis.sadd(
                `portal:${portal_id}:user:${__uid}`,
                product.product_Id
              );
            }
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
