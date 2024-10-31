import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app";
import Category from "../models/categoryModel";
const api = supertest(app);

//Write test here

describe("Category API tests", () => {
  let categoryId = "66e341dd97aaa45c6b839f7f";

  // Test for getting all categories
  test("should get all categories", async () => {
    const response = await api
      .get("/api/categories/main-category/main-relationship")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  // Test for getting a single category by ID
  test("should get a product category with all related products by id", async () => {
    const response = await api
      .get(`/api/categories/get-children-categories/${categoryId}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
      expect(Array.isArray(response.body)).toBe(true);
  });

});

afterAll(() => {
  mongoose.connection.close();
});
