
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import app from "../app";
import mongoose from "mongoose";
import User from "../models/userModel";
import Category from "../models/categoryModel";
import Product from "../models/productModel";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import supertest from "supertest";

dotenv.config();
const api = supertest(app);

// Increase the timeout for the test to 30 seconds
let accessToken;
jest.setTimeout(30000);

const mockUser = {
  first_name: "Test",
  last_name: "User",
  email: "test-user-order-admin@metropolia.fi",
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
let mockOrderItemId;
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


beforeAll(async () => {
  //setting up database for testing
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
  mockOrderItemId = orderItem._id;

  const res = await api.post("/api/auth/login").send({
    email: mockUser.email,
    password: "12345678",
  });
  // Get the access token
  // 0: Is the refreshToken, 1: Is the accessToken
  accessToken = res.headers["set-cookie"][1];
});

//clean up database with testing data
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

  await mongoose.connection.close();
});

describe("Admin Order API", () => {
  describe("GET /api/admin/orders", () => {
    it("should return all orders in the system with status code 200", async () => {
      const response = await api
        .get("/api/admin/orders/")
        .set("Cookie", [accessToken]); // Assuming you use a token for authentication

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.status).toContain("success");
    });
    it("should return Unauthenticated Error with status 401", async () => {
      const response = await api.get("/api/admin/orders/");


      expect(response.status).toBe(401);
    });
  });
  describe("GET /api/admin/orders/stats", () => {
    it("should return stats of orders of website and status 200", async () => {
      const response = await api
        .get("/api/admin/orders/stats")
        .set("Cookie", [accessToken]); // Assuming you use a token for authentication

      expect(response.status).toBe(200);
      expect(response.body.status).toContain("success");
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("allOrderNum");
      expect(response.body.data).toHaveProperty("processNum");
      expect(response.body.data).toHaveProperty("awaitNum");
      expect(response.body.data).toHaveProperty("deliveredNum");
      expect(response.body.data).toHaveProperty("cancelledNum");
    });
    it("should return Unauthenticated Error with status 401", async () => {
      const response = await api.get("/api/admin/orders/stats");
      expect(response.status).toBe(401);
    });
  });
  describe("PUT /api/admin/orders/:orderItemId", () => {
    it("should update order item status when provide orderItemId that exists in database and is authenticated", async () => {
      const selling_status = "await-pickup";
      const orderItem = await OrderItem.findOne({ _id: mockOrderItemId });
      const response = await api
        .put(`/api/admin/orders/${mockOrderItemId}`)
        .send({ selling_status: selling_status })
        .set("Cookie", [accessToken]);
      expect(response.status).toBe(200);
      expect(response.body.status).toContain("success");
      expect(response.body).toHaveProperty("data");
    });
    it("should return status 400 when not provide orderItemId, provide invalid Id", async () => {
      const invalidId = "123";
      const selling_status = "await-pickup";
      const response = await api
        .put(`/api/admin/orders/${invalidId}`)
        .send({ selling_status: selling_status })
        .set("Cookie", [accessToken]);
      expect(response.status).toBe(400);
      expect(response.body.status).toContain("fail");
    });
    it("should return status 400 when provide invalid status and authenticated", async () => {
      const invalidStatus = "test_status";
      const response = await api
        .put(`/api/admin/orders/${mockOrderItemId}`)
        .send({ selling_status: invalidStatus })
        .set("Cookie", [accessToken]);
      expect(response.status).toBe(400);
      expect(response.body.status).toContain("fail");
      expect(response.body.message).toContain("Cannot change status");
    });
    it("should return status 401 when is not authenticated", async () => {
      const selling_status = "await-pickup";
      const response = await api
        .put(`/api/admin/orders/${mockOrderItemId}`)
        .send({ selling_status });
      expect(response.status).toBe(401);
      expect(response.body.message).toContain("No access token");
    });
  });
});
