import mongoose from "mongoose";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";

import { isValidId } from "../utils/dbUtils.js";

const LIMIT = 8;
const SELLING_STATUS_LIST = [
  "processing",
  "await-pickup",
  "delivered",
  "cancelled",
];

///User management
// Define user management's initial query conditions
const queryConditions = {
  role: { $ne: "admin" },
};

// Get users based on the query parameters
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
    const limit = LIMIT; // Set the limit for each page

    // Validate page and limit
    if (page < 1) {
      return res.status(400).json({ message: "Invalid page" });
    }

    const skip = (page - 1) * limit; // Calculate how many products to skip

    // Get status and search from query parameters
    const { status, search } = req.query;

    // Define the query conditions if given
    const updateQueryConditions = {
      ...queryConditions,
      ...(status ? { status } : {}),
      ...(search ? { email: { $regex: new RegExp(search, "i") } } : {}),
    };

    let users = await User.find(updateQueryConditions)
      .sort({ createdAt: -1, status: 1 })
      .select("email role status")
      .skip(skip)
      .limit(limit);

    const totalUsersDisplay = await User.countDocuments(updateQueryConditions);

    res.json({
      users,
      totalUsersDisplay,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getAllUserCount = async (req, res) => {
  try {
    const allUsersCount = await User.countDocuments(queryConditions);

    const activeUserCount = await User.countDocuments({
      ...queryConditions,
      status: "active",
    });
    const bannedUserCount = await User.countDocuments({
      ...queryConditions,
      status: "banned",
    });
    const deletedUserCount = await User.countDocuments({
      ...queryConditions,
      status: "deleted",
    });
    res.json({
      allUsersCount,
      activeUserCount,
      bannedUserCount,
      deletedUserCount,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Admin cannot change the status of banned user
    if (user.status !== "deleted") {
      user.status = status;
      await user.save();
    } else {
      return res
        .status(400)
        .json({ message: "Cannot change status of deleted user" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

///Product management

//create aggregation pipeline for fetching products sort by status then created_at
const createAggregationPipeline = (status, search, skip, limit) => {
  const matchStage = {};
  if (status) {
    matchStage.status = status;
  }
  if (search) {
    if (mongoose.Types.ObjectId.isValid(search)) {
      matchStage._id = new mongoose.Types.ObjectId(search);
    } else {
      // If search term is invalid, return an empty result set
      return [{ $match: { _id: null } }];
    }
  }

  return [
    { $match: matchStage },
    {
      $addFields: {
        sortOrder: {
          $switch: {
            branches: [
              { case: { $eq: ["$status", "processing"] }, then: 1 },
              { case: { $eq: ["$status", "active"] }, then: 2 },
              { case: { $eq: ["$status", "sold"] }, then: 3 },
            ],
            default: 4,
          },
        },
      },
    },
    { $sort: { sortOrder: 1, created_at: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];
};

// Get all products with optional status and search filter
export const adminGetAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
    const limit = LIMIT; // Get the limit from the query parameter
    const status = req.query.status || null; // Get the status filter from the query parameter
    const search = req.query.search || null; // Get the search filter from the query parameter

    // Validate page and limit
    if (page < 1) {
      return res.status(400).json({ message: "Invalid page" });
    }

    const skip = (page - 1) * limit; // Calculate how many products to skip

    // Fetch and sort products using aggregation
    const products = await Product.aggregate(
      createAggregationPipeline(status, search, skip, limit)
    );

    // Get the total count of products based on status and search
    const totalProducts = search
      ? products.length
      : await Product.countDocuments(status ? { status } : {});

    // If no products found
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Send both products and total count in the response
    res.status(200).json({
      products,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get counts for each status
export const adminGetProductCounts = async (req, res) => {
  try {
    const activeCount = await Product.countDocuments({ status: "active" });
    const processingCount = await Product.countDocuments({
      status: "processing",
    });
    const soldCount = await Product.countDocuments({ status: "sold" });
    const allCount = await Product.countDocuments();

    res.status(200).json({
      allCount,
      activeCount,
      processingCount,
      soldCount,
    });
  } catch (error) {
    console.error("Error fetching product counts:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Activate a product
export const activateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product Id",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.status !== "processing") {
      return res.status(400).json({
        message: "Only products with 'processing' status can be activated",
      });
    }

    product.status = "active";
    await product.save();

    res
      .status(200)
      .json({ message: "Product activated successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to activate product", error: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product Id",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

///Order management

export const getOrderItemStats = async (req, res) => {
  try {
    const allOrderNum = await OrderItem.countDocuments();
    const processNum = await OrderItem.countDocuments({
      selling_status: SELLING_STATUS_LIST[0],
    });
    const awaitNum = await OrderItem.countDocuments({
      selling_status: SELLING_STATUS_LIST[1],
    });
    const deliveredNum = await OrderItem.countDocuments({
      selling_status: SELLING_STATUS_LIST[2],
    });
    const cancelledNum = await OrderItem.countDocuments({
      selling_status: SELLING_STATUS_LIST[3],
    });

    const stats = {
      allOrderNum,
      processNum,
      awaitNum,
      deliveredNum,
      cancelledNum,
    };
    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getAllOrderItems = async (req, res) => {
  try {
    let orderItems;
    const queryObj = { ...req.query };

    // if query have page, exclude it so can use find
    const excludingFields = ["page"];
    excludingFields.forEach((el) => delete queryObj[el]);

    const currentPage = req.query.page * 1 || 1; // convert the page from query from string to num
    const limit = LIMIT;
    const skip = (currentPage - 1) * limit;

    orderItems = await OrderItem.find(queryObj)
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrderItemNum = await OrderItem.countDocuments(queryObj);

    res.status(200).json({
      status: "success",
      totalItems: totalOrderItemNum,
      limit: limit,
      count: orderItems.length,
      data: orderItems,
    });
  } catch (error) {
    res.status(404).json({
      message: "No Order Exists",
    });
  }
};

export const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderItemId } = req.params;
    const { selling_status } = req.body;

    if (!orderItemId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing id",
      });
    }
    if (!isValidId(orderItemId)) {
      return res.status(400).json({
        status: "fail",
        message: "invalid id",
      });
    }

    if (!selling_status || !SELLING_STATUS_LIST.includes(selling_status)) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot change status",
      }); 
    }

    const updatedOrderItem = await OrderItem.findOneAndUpdate(
      { _id: orderItemId },
      { $set: { selling_status: `${selling_status}` } },
      { returnDocument: "after" }
    );

    res.status(200).json({
      status: "success",
      data: updatedOrderItem,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
