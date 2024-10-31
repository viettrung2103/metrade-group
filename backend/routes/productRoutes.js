import express from "express";
import {
  getAllProducts,
  searchProducts,
  productDetail,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/detail/:id", productDetail);
router.get("/newsfeed", getAllProducts);
router.get("/search", searchProducts);


export default router;
