const Redis = require("ioredis");
const redis = new Redis(6379);
const pipeline = redis.pipeline();
const { readHtml, buildHtml } = require("./doT");

async function testing() {
  let portal_id = 1;
  let category = "Phu Kien Dien Thoai";
  let __uid = "e34c6499-014b-4580-b2f9-1f53029f598e";
  let limit = 5;
  let keySameCategory = `portal:${portal_id}:category:${category}:mostview`;
  let keyRecentlyView = `portal:${portal_id}:user:${__uid}:mostview`;

  let pipeline = redis.pipeline();

  let productIds = await pipeline
    .zrevrange(keySameCategory, 0, limit - 1, "WITHSCORES")
    .zrevrange(keyRecentlyView, 0, limit - 1, "WITHSCORES")
    .exec();
  console.log("productIds: ", productIds);

  let productIdSameCategory = productIds[0][1].filter((_, i) => i % 2 === 0);
  let productViewSameCategory = productIds[0][1].filter((_, i) => i % 2 === 1);

  let productIdRecentlyView = productIds[1][1].filter((_, i) => i % 2 === 0);
  let productViewRecentlyView = productIds[1][1].filter((_, i) => i % 2 === 1);

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
    .map((cur, index) => ({ ...cur, view: productViewSameCategory[index] }));

  const productRecentlyView = productInfo
    .slice(productIdSameCategory.length)
    .map((cur, index) => {
      return { ...cur, view: productViewRecentlyView[index] };
    });

  console.log("productSameCategory: ", productSameCategory);
  console.log("productRecentlyView: ", productRecentlyView);

  let template = await readHtml(`../view/portal_${portal_id}.html`);
  let htmlSameCategory = buildHtml(
    template,
    productSameCategory,
    "Top product of the same category"
  );
  console.log(htmlSameCategory);
  let htmlRecentlyView = buildHtml(
    template,
    productRecentlyView,
    "Recently view product"
  );
  console.log(htmlRecentlyView);
}

testing();
