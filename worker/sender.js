const amqp = require("amqplib/callback_api");
const db = require("../models/ProductModel");

const RABBIT_URL =
  "amqps://pczwwnhc:6er36JR6Oz8wr_jLh6aDD32JvEMwDHjB@mustang.rmq.cloudamqp.com/pczwwnhc";

const RABBIT_QUEUE_NAME = "";

amqp.connect(RABBIT_URL, function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    let queue = "hello";
    let msg = "Hello world";

    channel.assertQueue(queue, {
      durable: false,
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(` [x] Sent ${msg}`);
    setTimeout(function () {
      connection.close();
      process.exit(0);
    }, 500);
  });
});
