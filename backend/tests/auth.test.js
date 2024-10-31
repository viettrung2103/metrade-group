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

const mockUserRegister = {
  first_name: "test",
  last_name: "test",
  email: "test@metropolia.fi",
  password: "password",
};

const mockUserResend = {
  first_name: "test1",
  last_name: "test1",
  email: "test1@metropolia.fi",
  password: "password",
};

const mockExistingUser = {
  first_name: "user",
  last_name: "user",
  email: "user@metropolia.fi",
  password: "password",
};

beforeAll(async () => {
  // Ensure the mock user is deleted before creating it
  // await User.deleteMany({ email: mockUserRegister.email });
  // await User.deleteMany({ email: mockUserResend.email });
  // await User.deleteMany({ email: mockExistingUser.email });
});

afterAll(async () => {
  await User.deleteMany({ email: mockUserRegister.email });
  await User.deleteMany({ email: mockUserResend.email });
  await User.deleteMany({ email: mockExistingUser.email });
  await mongoose.connection.close();
});

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should signup a new user with valid credentials", async () => {
      // Arrange

      // Act
      const response = await api
        .post("/api/auth/register")
        .send(mockUserRegister);

      // Assert
      expect(response.header["content-type"]).toContain("application/json");
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("data");
      email = response.body.data.user.email;
      verifyToken = response.body.data.user.validation_token.value;
    });
    it("should return status 400 due to missing information or sending invalid email", async () => {
      // Arrange
      const cases = [
        {
          first_name: "test",
          last_name: "test",
          email: "test@metropolia.fi",
        },
        {
          first_name: "test",
          last_name: "test",
          email: "test@gmail.fi",
          password: "password",
        },
      ];

      for (const user of cases) {
        // Act
        const response = await api.post("/api/auth/register").send(user);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.status).toContain("fail");
      }
    });
    it("should return status 400 due to register with existing email", async () => {
      // Arrange;
      // const mockExistingUser = {
      //   first_name: "user",
      //   last_name: "user",
      //   email: "user@metropolia.fi",
      //   password: "password",
      // };
      await User.create(mockExistingUser);

      const existingUser = {
        ...mockExistingUser,
      };

      //Act
      const response = await api.post("/api/auth/register").send(existingUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
    });
  });
  describe("POST /api/auth/register/verify", () => {
    it("should return status 200 when verify with newly created token and user", async () => {
      const response = await api
        .post("/api/auth/register/verify")
        .send({ email, token: verifyToken });
      expect(response.status).toBe(200);
      expect(response.body.status).toContain("success");
    });
    it("should return status 400 when try to verify user who is already verified", async () => {
      await api
        .post("/api/auth/register/verify")
        .send({ email, token: verifyToken });

      const response = await api
        .post("/api/auth/register/verify")
        .send({ email, token: verifyToken });
      expect(response.status).toBe(400);
      expect(response.body.status).toContain("fail");
      expect(response.body.message).toContain("User is already verified");
    });
    it("should return status 400 when verify with user who is not in database", async () => {
      const notExistEmail = "notexist@metropolia.fi";
      const response = await api
        .post("/api/auth/register/verify")
        .send({ email: notExistEmail, token: verifyToken });
      expect(response.status).toBe(404);
      expect(response.body.status).toContain("fail");
      expect(response.body.message).toContain("does not exist");
    });
  });
  describe("POST /api/auth/resend-verification-email", () => {
    it("should return status 200 and send new email if unverified user request a new email", async () => {
      await api.post("/api/auth/register/").send(mockUserResend);

      const response = await api
        .post("/api/auth/resend-verification-email")
        .send({ email: mockUserResend.email });
      expect(response.status).toBe(201);
      expect(response.body.status).toContain("success");
    });
    it("should return status 400 when missing email or email is not valid or user is alread verified", async () => {
      const newDatas = [
        {},
        {
          email: "test@gmail.com",
        },
        {
          email: "test@metropolia.fi",
        },
      ];
      for (const data of newDatas) {
        const response = await api
          .post("/api/auth/resend-verification-email")
          .send(data);
        expect(response.status).toBe(400);
        expect(response.body.status).toContain("fail");
      }
    });
  });
  describe("POST /api/auth/login", () => {
    it("should return 200 if provide correct credentials", async () => {
      const userInfo = {
        email: mockUserRegister.email,
        password: mockUserRegister.password,
      };
      const response = await api.post("/api/auth/login").send(userInfo);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Login successful");
    });
    it("should return 200 with accessToken and refreshToken with correct credentials", async () => {
      const userInfo = {
        email: mockUserRegister.email,
        password: mockUserRegister.password,
      };
      const response = await api.post("/api/auth/login").send(userInfo);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Login successful");

      // Check Cookies
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.startsWith("refreshToken="))).toBe(
        true
      );
      expect(cookies.some((cookie) => cookie.startsWith("accessToken="))).toBe(
        true
      );
    });
    it("should return 400 if not provide enough info", async () => {
      const missingCases = [
        {},
        { email: "missing@metropolia.fi" },
        { password: "missingpassword" },
      ];
      for (const missingCase of missingCases) {
        const response = await api.post("/api/auth/login").send(missingCase);
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("must be included");
      }
    });
    it("should return 401 if provided email not exist in db or provide wrong password credentials", async () => {
      const wrongCases = [
        {
          email: "notExist@metropolia.fi",
          password: "password",
        },
        {
          email: "test@metropolia.fi",
          password: "wrongPassword",
        },
      ];
      for (const wrongCase of wrongCases) {
        const response = await api.post("/api/auth/login").send(wrongCase);
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Invalid");
      }
    });
  });
  describe("POST /api/auth/logout", () => {
    it("should return 200 when provided valid userId", async () => {
      const user = await User.findOne({ email });
      // console.log(user);
      const userId = { userId: user._id };
      // console.log(userId);

      const response = await api.post("/api/auth/logout").send(userId);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Logout successfully");
    });
    it("should return 200 when provided valid userId and clear cookies if log out is successfully", async () => {
      const user = await User.findOne({ email });

      const userId = { userId: user._id };

      const response = await api.post("/api/auth/logout").send(userId);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Logout successfully");
      const cookies = response.headers["set-cookie"];
      const refreshTokenCookie = cookies.find((cookie) =>
        cookie.startsWith("refreshToken")
      );
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.startsWith("accessToken")
      );
      expect(cookies).toBeDefined();
      expect(refreshTokenCookie).toContain("refreshToken=;");
      expect(accessTokenCookie).toContain("accessToken=;");
    });

    it("it should return 500 when provide invalid userId", async () => {
      const inValidId = "123";
      const response = await api.post("/api/auth/logout").send(inValidId);
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Error during logout");
    });
  });
});
