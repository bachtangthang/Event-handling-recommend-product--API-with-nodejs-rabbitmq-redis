const Redis = require("ioredis");
const redis = new Redis(6379);
const { xoa_dau } = require("./xoadau");
const { readHtml, buildHtml } = require("./doT");
const { productsTest } = require("../data");
const ok = async () => {
  console.log(productsTest);
  let html = await readHtml("../view/portal_1.html");
  console.log(html);
  let returnHtml = buildHtml(html, productsTest, "this is testing");
  console.log(returnHtml);
};
ok();
