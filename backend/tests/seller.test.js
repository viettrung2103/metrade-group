import request from "supertest";
import mongoose from "mongoose";
import Product from "../models/productModel";
import User from "../models/userModel";
import app from "../app";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Increase the timeout for the test to 30 seconds
jest.setTimeout(30000);

// Mock user data
const mockUser = {
  first_name: "Test",
  last_name: "User",
  email: "testseller@metropolia.fi",
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
  user_id: "", 
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

let accessToken;
let appServer;
let productId;

beforeAll(async () => {
  // Start the server and return the appServer
  appServer = app.listen(0);

  // Ensure the mock user is deleted before creating it
  await User.deleteMany({ email: mockUser.email });

  // Insert the mock user into the database
  const user = await User.create(mockUser);
  mockProduct.user_id = user._id;

  // Simulate login to get access token
  const res = await request(appServer).post("/api/auth/login").send({
    email: mockUser.email,
    password: "12345678",
  });

  // Get the access token
  accessToken = res.headers["set-cookie"][1];
});

afterAll(async () => {
  // Clean up the database by removing the mock user and products
  await User.deleteMany({ email: mockUser.email });
  await Product.deleteMany({ _id: productId });
  mongoose.connection.close();
  appServer.close();
});

describe("Seller API Tests", () => {
  // Test uploading a product
  it("should upload a product and return 201", async () => {
    const res = await request(appServer)
      .post("/api/seller/upload")
      .set("Cookie", [accessToken])
      .send(mockProduct);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toEqual(mockProduct.name);

    // Store the created product ID for cleanup
    productId = res.body.product._id;
  });

  // Test fetching products by user ID
  it("should return 200 for fetching products by user ID", async () => {
    const res = await request(appServer)
      .get(`/api/seller/selling-page/inventory/${mockProduct.user_id}`)
      .set("Cookie", [accessToken]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test updating a product
  it("should update a product and return 200", async () => {
    const updatedData = {
      user_id: mockProduct.user_id,
      name: "Test Update Product",
      image: "http://example.com/image.jpg",
      photos: [
        "http://example.com/photo1.jpg",
        "http://example.com/photo2.jpg",
      ],
      description: "A test product description.",
      price: 100,
      pickup_point: "Myllypuro",
      category_id: new mongoose.Types.ObjectId(), // Mock category ID
      stock_quantity: 10,
      status: "active",
      keywords: ["test", "product"],
    };

    const res = await request(appServer)
      .put(`/api/seller/update/${productId}`)
      .set("Cookie", [accessToken])
      .send(updatedData);
    

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toEqual(updatedData.name);
    expect(res.body.product.description).toEqual(updatedData.description);
    expect(res.body.product.price).toEqual(updatedData.price);
  });

  // Test fetching products by user ID with no products
  it("should return 404 for fetching products by user ID with no products", async () => {
    const nonExistingUserId = new mongoose.Types.ObjectId();
    const res = await request(appServer)
      .get(`/api/seller/selling-page/inventory/${nonExistingUserId}`)
      .set("Cookie", [accessToken]);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("No products found");
  });

  // Test uploading a product with invalid user ID
  it("should return 400 for uploading a product with invalid user ID", async () => {
    const invalidProduct = { ...mockProduct, user_id: "invalidID" };
    const res = await request(appServer)
      .post("/api/seller/upload")
      .set("Cookie", [accessToken])
      .send(invalidProduct);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual("Invalid User Id");
  });

  // Test updating a product with invalid category ID
  it("should return 400 for updating a product with invalid category ID", async () => {
    const updatedData = { ...mockProduct, category_id: "invalidID" };
    const res = await request(appServer)
      .put(`/api/seller/update/${productId}`)
      .set("Cookie", [accessToken])
      .send(updatedData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual("Invalid Category Id");
  });
});
