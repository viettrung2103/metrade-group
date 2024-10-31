import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";


//Get all products
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; //get the page number from the query parameter
    const limit = parseInt(req.query.limit) || 8; //get the limit from the query parameter

    // Validate page and limit
    if (page < 1 || limit < 1) {
      return res
        .status(400)
        .json({ message: "Invalid page or limit parameter" });
    }

    const skip = (page - 1) * limit; //calculate how many products to skip
    const totalProducts = await Product.find({ status: "active" }).countDocuments(); //get the total count of products
    const products = await Product.find({ status: "active" })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit); //sort by created at time then skip and limit products based on the query

    //if no products found
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    //send both products and total count in the response
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

//Search for products based on query
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query; //get the "query" parameter from the request
    const products = await Product.find({
      $and: [
        { status: "active" },
        {
          $or: [
            { name: { $regex: query, $options: "i" } }, //search for query in the product's name
            { description: { $regex: query, $options: "i" } }, //search for query in the product's description
            { keywords: { $regex: query, $options: "i" } }, //search for query in the product's keywords
          ],
        },
      ],
    });

    //if no products found
    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found matching the query" });
    }

    //send both results and total count in the response
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching search results");
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//Get product detail by Id
export const productDetail = async (req, res) => {
  const id = req.params.id;
  //if lack of id
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Missed product id",
    });
  }
  //check if id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product id format",
    });
  }

  try {
    //find product from product collection
    const product = await Product.findById(id).populate({
      path: "category_id",
      populate: {
        path: "ancestors",
        select: "name",
      },
    });
    //if no product found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    //if found product successfully

    res.status(200).json({
      success: true,
      message: "Product found",
      product: { ...product._doc },
    });
  } catch (error) {
    console.log(error);
    //Handle any server errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//Get products by sub category
export const getProductsByCategory = async (req, res) => {
  const chosenCategory = req.params.categoryId;

  try {
    const products = await Product.find({ category_id: chosenCategory });

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

//Get all products belong to a main category
export const getProductsByCategoryV1 = async (req, res) => {
  // handle when categoryId is not of Object Type
  let chosenCategoryId;
  try {
    chosenCategoryId = new mongoose.Types.ObjectId(req.params.categoryId);
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: "invalid category id",
    });
  }
  // console.log("id ", chosenCategoryId);
  try {
    const categoryObj = await Category.aggregate([
      //find the category matched the id in urlquery
      { $match: { _id: chosenCategoryId } },
      // create a array called catGraph ( or category hierarchy), which contain all the categories
      // which are the subcategories of this categories and the sub-subcategories of the subcategories
      {
        $graphLookup: {
          from: "categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent_id",
          as: "categoryHierarchy",
        },
      },
    ]);

    if (categoryObj.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "this category does not exist",
      });
    }
    //extract the _id of each element inside the catGraph array + the input _id
    //and put into the array called categoriesIdList
    // find the products based on this list $in
    // console.log(categories[0].categoryHierarchy);
    console.log("object array", categoryObj);
    // const categoryHierarchy = categoryObj[0].categoryHierarchy;
    const categoryIds = categoryObj[0].categoryHierarchy.map(
      (category) => category._id
    );
    // categoryIds.push(chosenCategoryId);
    console.log("category id", categoryIds);
    const products = await Product.find({
      category_id: { $in: categoryIds },
    });

    res.status(200).json({
      status: "success",
      count: products.length,
      data: {
        products,
        categoryObj,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Interal server error",
    });
  }
};


