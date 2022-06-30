const dot = require("dot");
const fs = require("fs");
const { productsTest } = require("../data");
function readHtml(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", function (err, data) {
      if (err) return reject(err.message);
      //console.log("result read: " + data);
      resolve(data);
    });
  });
}

function buildHtml(html, products, title) {
  try {
    let dotP = dot.template(html);
    let final = dotP({
      title: title,
      products: products,
    });
    return final;
  } catch (err) {
    console.log(err);
  }
}
module.exports = { readHtml, buildHtml };
