const fetch = require("node-fetch");
const { productModel } = require("../models/index");
const { deepEqual } = require("./deepEquality");
// let product = fetch(
//   "http://localhost:5000/products/120?columns=product_id,product_name",
//   {
//     mode: "no-cors",
//   }
// )
//   .then((response) => response.json())
//   .then((data) => console.log("data", data));

// data =
//   product_name: "thịt chó phong cách Quảng Ngãi",
//   Image_url: "url",
//   landing_page_url: "landing_page_url",
//   category: "thit cho",
//   price: 10000,
//   status: 1,
//   product_id: "123-456-789123151231",
//   portal_Id: 1,
// };

// let id;
// fetch("http://localhost:5000/products", {
//   method: "POST",
//   headers: {
//     "Content-type": "application/json",
//   },
//   body: JSON.stringify(data),
// })
//   .then((response) => response.json())
//   .then(
//     (data1) => (id = data1.id),
//     () => console.log(id)
//   );

// const demo_uid = "b023e4e6-431a-4fae-bbb2-d7e9e8a39a98";

// try {
//   fetch("http://localhost:5000/users/identify", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ demo_uid }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//     });
// } catch (err) {
//   console.log(err);
// }
// const payload = {
//   __uid: "bcfb1f37-47ce-4fad-8ef6-386627cc4395",
//   event: "view_product",
//   products: [
//     {
//       product_name: "thịt chó phong cách Quảng Ngãi",
//       Image_url: "url",
//       landing_page_url: "landing_page_url",
//       category: "thit cho",
//       price: 10000,
//       status: 1,
//       product_id: "123-456-789123151231",
//       portal_Id: 1,
//     },
//   ],
// };

// fetch("http://localhost:5000/eventHistories/events", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify(payload),
// })
//   .then((response) => response.json())
//   .then((data) => console.log(data));

// async function check() {
//   let result = await productModel.checkExist("105528");
//   console.log(result[0].exists);
// }
// check();
//console.log(id);

// const obj1 = { 12: "mothai", 123: "mothaiba" };
// const obj2 = { 123: "mothaiba", 12: "mothai" };

// let result = deepEqual(obj1, obj2);
// console.log(result);

const Redis = require("ioredis");
const redis = new Redis(6379);
key = "7c034e25-63d4-48e2-a4e1-5e522a2324c5:mostview";
async function abc() {
  let productIds = await redis.zrevrange(key, 0, -1, "WITHSCORES");
  console.log(productIds);
  let view = await redis.zscore(key, 67687);
  console.log(view);
}
abc();
