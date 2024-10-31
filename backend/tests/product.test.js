import request from "supertest";
import mongoose from "mongoose";
import Product from "../models/productModel";
import User from "../models/userModel";
import app from "../app";
import dotenv from "dotenv";
import bcrypt from 'bcryptjs';

dotenv.config();

// Increase the timeout for the test to 30 seconds
jest.setTimeout(30000);

// Mock user data
const mockUser = {
  first_name: "Test",
  last_name: "User",
  email: "testuser@metropolia.fi",
  phone: "123456789",
  balance: 1000,
  password: bcrypt.hashSync("12345678", parseInt(process.env.SALT_ROUNDS)),
  role: "user",
  photo_url: "",
  is_verified: true,
  status: "active",
};

// Mock product data
const mockProduct = {
  user_id: '',
  name: "Test Product",
  image: "http://example.com/image.jpg",
  photos: ["http://example.com/photo1.jpg", "http://example.com/photo2.jpg"],
  description: "A test product description.",
  price: 100,
  pickup_point: "Myllypuro",
  category_id: new mongoose.Types.ObjectId(), // Mock category ID
  stock_quantity: 10,
  status: "active",
  keywords: ["test", "product"],
};

let appServer;
let productId;

beforeAll(async () => {
  // Start the server and return the appServer
  appServer = app.listen(0);

  // Insert the mock user into the database
  const user = await User.create(mockUser);
  mockProduct.user_id = user._id;


  // Insert the mock product into the database
  const product = await Product.create(mockProduct);
  productId = product._id;
  
  await Product.create(mockProduct);
  await Product.create(mockProduct);
  await Product.create(mockProduct);

});

afterAll(async () => {
  // Clean up the database by removing the mock products and user
  await User.deleteMany({ email: mockUser.email });
  await Product.deleteMany({ name: mockProduct.name });
  mongoose.connection.close();
  appServer.close();
});

describe("Product API Tests", () => {
  // Test fetching all products
  it("should return 200 for fetching all products", async () => {
    const res = await request(appServer)
      .get("/api/product/newsfeed")
      .query({ page: 1, limit: 8 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.products).toBeDefined();
    expect(res.body.totalProducts).toBeDefined();
  });

  // Test searching for products
  it("should return 200 for searching products", async () => {
    const res = await request(appServer)
      .get("/api/product/search")
      .query({ query: "Test" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test fetching product details
  it("should return 200 for fetching product details", async () => {
    const res = await request(appServer).get(
      `/api/product/detail/${productId}`
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toEqual(mockProduct.name);
  });

  // Test fetching product details with invalid ID
  it("should return 400 for fetching product details with invalid ID", async () => {
    const res = await request(appServer).get("/api/product/detail/invalidID");

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual("Invalid product id format");
  });

  // Test fetching product details with non-existing ID
  it("should return 404 for fetching product details with non-existing ID", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const res = await request(appServer).get(
      `/api/product/detail/${nonExistingId}`
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual("Product not found");
  });
});
