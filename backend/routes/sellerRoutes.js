import express from "express";
import upload from "../configs/cloudinary.js";
import {
  uploadProduct,
  uploadProductImages,
  getProductsByUserId,
  updateProduct
} from "../controllers/sellerController.js";

const router = express.Router();

router.post("/upload", uploadProduct);
router.post("/imageUpload", upload.array("files", 4), uploadProductImages);
router.get("/selling-page/inventory/:userId", getProductsByUserId);
router.put("/update/:id", updateProduct);

export default router;