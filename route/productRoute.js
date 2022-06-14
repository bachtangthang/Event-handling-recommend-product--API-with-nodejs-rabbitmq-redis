const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/products", productController.getAll); //ok
// router.get("/products/:id", productController.getDetail); //ok
router.post("/products", productController.createProduct); //ok
router.put("/products/:id", productController.updateProductById); //ok
router.delete("/products/:id", productController.deleteProductById); //ok

router.get("/products/:id", productController.getProductFromRedis); //ok

module.exports = router;
