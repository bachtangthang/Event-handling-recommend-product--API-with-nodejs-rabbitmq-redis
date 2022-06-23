const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/mostViewProductByUser", productController.mostViewProductByUser);
router.get(
  "/mostViewProductByCategory",
  productController.mostViewProductByCategory
);

router.get(
  "/getTopMostViewProductByCategory",
  productController.getTopMostViewProductByCategory
);
// router.get("/:id", productController.getDetail); //ok
router.put("/:id", productController.updateProductById); //ok
router.delete("/:id", productController.deleteProductById); //ok

router.post("/upsertMany", productController.upsertMany);

router.post(
  "/getHtmlTopViewProductByCategory",
  productController.getHtmlTopViewProductByCategory
);
router.post("/getHtmlViewedProduct", productController.getHtmlViewedProduct);

router.post("/", productController.createProduct); //ok
router.get("/getAll", productController.getAll); //ok
router.get("/:id", productController.getProductFromRedis); //ok

module.exports = router;
