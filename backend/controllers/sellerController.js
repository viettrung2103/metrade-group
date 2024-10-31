import mongoose from "mongoose";
import Product from "../models/productModel.js";

// Upload a new product
export const uploadProduct = async (req, res) => {
  const {
    user_id,
    name,
    image,
    photos,
    description,
    price,
    pickup_point,
    category_id,
    keywords,
    stock_quantity,
  } = req.body;

  // Convert user_id and category_id to strings if they are objects
  const userId = typeof user_id === 'object' ? user_id.$oid : user_id;
  const categoryId = typeof category_id === 'object' ? category_id.$oid : category_id;

  // Check if the User ID and Category ID are valid ObjectId strings
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User Id",
    });
  }

  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Category Id",
    });
  }

  try {
    const newProduct = await Product.create({
      user_id: userId,
      name,
      image,
      photos,
      description,
      price,
      pickup_point,
      category_id: categoryId,
      keywords,
      stock_quantity,
      status: "processing",
    });

    res.status(201).json({
      success: true,
      message: "Product uploaded successfully",
      product: newProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error uploading product",
      error: error.message,
    });
  }
};

//Upload new product images
export const uploadProductImages = async (req, res) => {
  try {
    const urls = req.files.map((file) => file.path);
    res.status(200).json({ urls });
  } catch (error) {
    console.error("Error uploading images:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

//Get products by user_id
export const getProductsByUserId = async (req, res) => {
  const seller = req.params.userId;

  try {
    const products = await Product.find({ user_id: seller }).sort({status: 1});
    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      console.log("No products found");
      res.status(404).json({ message: "No products found" });
    }
  } catch (error) {
    console.log(error);
    // Handle any server errors
    res.status(500).json({ message: "Internal server error" });
  }
};
//Update product details
export const updateProduct = async (req, res) => {
  try {
    const {
    name,
    image,
    photos,
    description,
    price,
    pickup_point,
    category_id,
    keywords,
    stock_quantity,
    status,
  } = req.body;

  const { id } = req.params;

  // Convert and category_id to strings if they are objects
  const categoryId = typeof category_id === 'object' ? category_id.$oid : category_id;

  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Category Id",
    });
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, { name, image, photos, description, price, pickup_point, category_id: categoryId, keywords, stock_quantity, status }, { new: true });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product: updatedProduct, 
  });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};