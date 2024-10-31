import request from "supertest";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import app from "../app";
import mongoose from "mongoose";
import User from "../models/userModel";
import Cart from "../models/cartModel";
import CartItem from "../models/cartItemModel";
import Category from "../models/categoryModel";
import Product from "../models/productModel";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import supertest from "supertest";

dotenv.config();
const api = supertest(app);

// Increase the timeout for the test to 30 seconds
let accessToken;
let appServer;
let verifyToken;
let email;
jest.setTimeout(30000);

const mockUser = {
  first_name: "Test",
  last_name: "User",
  email: "test-user-order@metropolia.fi",
  phone: "1234567891",
  balance: 1000,
  password: bcrypt.hashSync("12345678", parseInt(process.env.SALT_ROUNDS)),
  role: "user",
  photo_url: "",
  is_verified: true,
  status: "active",
};

const mockCategory = {
  name: "Test Category",
  description: "This is a test category",
  parent_id: null,
  ancestors: [],
  children: [],
  is_active: true,
};

// Mock product data
const mockProduct = {
  user_id: "",
  name: "Test Product",
  image: "test.jpg",
  photos: [],
  description: "This is a test product",
  price: 10,
  pickup_point: "Myllypuro",
  category_id: "",
  stock_quantity: 1000,
  status: "active",
};

//Mock Order data
const mockOrder = {
  user_id: "",
  total_item_quanlity: 0,
  total_price: 0,
};

//Mock Order Item data
const mockOrderItem = {
  order_id: "", // Mock ObjectId for order
  product_id: "", // Mock ObjectId for product
  product_name: "",
  image: "",
  sold_quantity: 2,
  price: 0,
  pickup_point: "",
  sub_total: 0, // Calculated as sold_quantity * price
  selling_status: "processing", // Default status
};

// let accessToken;

beforeAll(async () => {
  const user = await User.create(mockUser);
  mockProduct.user_id = user._id;
  mockOrder.user_id = user._id;

  const category = await Category.create(mockCategory);
  mockProduct.category_id = category._id;

  const product = await Product.create(mockProduct);
  mockOrderItem.product_id = product._id;
  mockOrderItem.product_name = product.name;
  mockOrderItem.image = product.image;
  mockOrderItem.price = product.price;
  mockOrderItem.pickup_point = product.pickup_point;
  mockOrderItem.sub_total = mockOrderItem.price * mockOrderItem.sold_quantity;

  mockOrder.total_item_quantity = mockOrderItem.sold_quantity;
  mockOrder.total_price = mockOrderItem.sub_total;

  const order = await Order.create(mockOrder);
  mockOrderItem.order_id = order._id;

  const orderItem = await OrderItem.create(mockOrderItem);

  const res = await api.post("/api/auth/login").send({
    email: mockUser.email,
    password: "12345678",
  });
  // Get the access token
  // 0: Is the refreshToken, 1: Is the accessToken
  accessToken = res.headers["set-cookie"][1];
});

afterAll(async () => {
  const user = await User.findOne({ email: mockUser.email });

  if (user) {
    // Clean up Orders and OrderItems related to the mock user
    const orderIds = (await Order.find({ user_id: user._id })).map(
      (order) => order._id
    );

    // Clean up OrderItems first, as they reference the Order
    await OrderItem.deleteMany({ order_id: { $in: orderIds } });

    // Clean up Orders
    await Order.deleteMany({ user_id: user._id });

    // Clean up other test data (User, Category, Product)
    await User.deleteMany({ email: mockUser.email });
    await Category.deleteMany({ name: mockCategory.name });
    await Product.deleteMany({ user_id: user._id });
  }
  //close db connection after each test
  await mongoose.connection.close();
});

describe("Order API Test", () => {
  describe("GET /api/orders/order-history", () => {
    it("should get order history of loggedin user with status code 200", async () => {
      const response = await api
        .get("/api/orders/order-history")
        .set("Cookie", [accessToken]);
      expect(response.status).toBe(200);
    });
    it("should not get order history if user is not Authenticated", async () => {
      const response = await api.get("/api/orders/order-history");
      expect(response.status).toBe(401);
    });
  });
});
