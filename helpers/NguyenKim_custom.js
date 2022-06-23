//code inside customjs extension
function crawlData(portal_id) {
  const product_name =
    document.getElementsByClassName("product_info_name")[0].innerText;
  console.log("product_name: ", product_name);

  const image_url =
    document.getElementsByClassName("img-full-width ")[0].currentSrc;
  console.log("image_url: ", image_url);

  let url = window.location.href;
  let landing_page_url = url.split("?")[0];
  console.log("landing_page_url: ", landing_page_url);

  const category = document
    .getElementsByClassName("pdp_breadcrumbs")[0]
    .getElementsByTagName("a")[1].innerText;
  //console.log("category:", category);

  const price =
    document.getElementsByClassName("nk-price-final")[0].dataset.price;
  //console.log("price: ",price);

  const product_Id =
    document.getElementsByClassName("nk-price-final")[0].dataset.product_id;
  console.log("product_id: ", product_Id);
  const crawledProduct = {
    product_name,
    image_url,
    landing_page_url,
    category,
    price,
    product_Id,
    status: 1,
    portal_id,
  };
  return crawledProduct;
}

//set cookie
function createCookie(name, value, days) {
  var expires;
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toGMTString();
  } else {
    expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

//get cookie
function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) {
        c_end = document.cookie.length;
      }
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return "";
}

async function identify(demo_uid, portal_id) {
  try {
    console.log(demo_uid);
    let response = await fetch("http://localhost:5000/users/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demo_uid, portal_id }),
    });
    let data = await response.json();
    console.log("thanh cong: ", data);
    await createCookie("demo_uid", data.uid, 1);
    demo_uid = getCookie("demo_uid");
    console.log("demo_uid after set cookie: ", demo_uid);
    let payload = {
      __uid: getCookie("demo_uid"),
      event: "viewProduct",
    };
    console.log("payload inside identify function: ", payload);
    return payload;
  } catch (err) {
    console.log(err);
  }
}

async function events(payload) {
  try {
    await fetch("http://localhost:5000/eventHistories/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
      });
  } catch (err) {
    console.log(err);
  }
}

async function getHtmlTopViewProductByCategory(recommendProductOfSameCategory) {
  try {
    let response = await fetch(
      "http://localhost:5000/products/getHtmlTopViewProductByCategory",
      {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recommendProductOfSameCategory),
      }
    );
    let data = await response.text();
    console.log("data in funtion: ");
    return data;
  } catch (err) {
    console.log(err);
  }
}

async function getHtmlViewedProduct(recommendRecentlyViewedProduct) {
  try {
    let response = await fetch(
      "http://localhost:5000/products/getHtmlViewedProduct",
      {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recommendRecentlyViewedProduct),
      }
    );
    let data = await response.text();
    console.log("data in function: ", data);
    return data;
  } catch (err) {
    console.log(err);
  }
}

function appendHtml(data) {
  console.log("data in appendHtml: ", data);
  const div = document.createElement("div");
  div.innerHTML = data;
  document
    .getElementsByClassName(
      "span16 nk-product-collection nk-product-special margbt10"
    )[0]
    .appendChild(div);
  console.log("div1: ", div);
}

async function main_NguyenKim(portal_id) {
  let crawledProduct = crawlData(portal_id);
  console.log("crawledProduct: ", crawledProduct);

  let demo_uid = getCookie("demo_uid");
  let payload = await identify(demo_uid, portal_id);
  console.log("after waiting: ", payload);

  payload.products = [crawledProduct];
  payload.portal_id = portal_id;
  console.log("payload: ", payload);
  await events(payload);

  let recommendProductOfSameCategory = {
    category: crawledProduct.category,
    records: 4,
    portal_id,
  };
  let htmlTopViewProduct = await getHtmlTopViewProductByCategory(
    recommendProductOfSameCategory
  );

  appendHtml(htmlTopViewProduct);

  let recommendRecentlyViewedProduct = {
    __uid: getCookie("demo_uid"),
    records: 4,
    portal_id,
  };
  let htmlViewedProduct = await getHtmlViewedProduct(
    recommendRecentlyViewedProduct
  );

  appendHtml(htmlViewedProduct);
}

main_NguyenKim(1);
