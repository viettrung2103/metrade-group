import express from "express";
const router = express.Router();

//Import category controllers
import {getProductsByCategory} from '../controllers/productController.js'
import {
  categoryHierarchy,
  getChildrenProducts,
} from "../controllers/categoryController.js";

//ROUTES

//Routes to categories
router.get('/:categoryId', getProductsByCategory)
router.get("/main-category/main-relationship", categoryHierarchy);
router.get("/get-children-categories/:categoryId", getChildrenProducts);


export default router;