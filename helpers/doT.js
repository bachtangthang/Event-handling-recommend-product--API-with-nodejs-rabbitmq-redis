const dot = require("dot");
const fs = require("fs");
const { productsTest } = require("../data");
function readHtml(path, products, title) {
  return new Promise((res, rej) => {
    console.log(title);
    fs.readFile(path, "utf8", function (err, data) {
      if (err) return console.log(err);
      console.log("result read: " + data);
      let dotP = dot.template(data);
      let final = dotP({
        title: title,
        products: products,
      });
      console.log(final);
      res(final);
    });
  });
}
module.exports = { readHtml };
