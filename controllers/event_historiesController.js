const { event_historiesModel } = require("../models/index");
const amqp = require("amqplib/callback_api");
const cookieParser = require("cookie-parser");

const RABBIT_URL = process.env.RABBIT_URL;

const RABBIT_QUEUE_NAME = "event";
const table = "event_histores";
//const tablePrimaryKey = "product_id";
//const DEFAULT_COLUMNS = "product_id,product_name,qty";
//const DEFAULT_SORT = "product_id";

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
  });
});

module.exports = {
  async events(req, res) {
    try {
      channel.sendToQueue(
        RABBIT_QUEUE_NAME,
        Buffer.from(JSON.stringify(req.body))
      );
      return res.status(200).json({});
    } catch (err) {
      console.log(err);
    }
  },
};
