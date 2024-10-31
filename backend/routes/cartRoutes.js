import express from "express";
import {addCartItem, getCartItem, getCartDetail, updateItemQuantity, deleteItem, checkout} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add-cart-item", addCartItem);
router.post("/get-cart-item", getCartItem);
router.get("/get-cart-detail", getCartDetail);
router.post("/update-quantity", updateItemQuantity);
router.delete("/delete-cart-item/:id", deleteItem);
router.post("/checkout", checkout);

export default router;