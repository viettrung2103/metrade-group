import mongoose from "mongoose";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

//Get all categories in database
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }).exec();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get categories with hierarchy from main -> sub -> sub-sub
export const categoryHierarchy = async (req, res) => {
  try {
    const mainCategories = await Category.find({ parent_id: null }).exec();
    //console.log(mainCategories);

    // Check if main categories exist
    if (!mainCategories || mainCategories.length === 0) {
      return res.status(404).json({ message: "No main categories found" });
    }

    // Populate children for each main category
    const populatedCategories = await Promise.all(
      mainCategories.map(async (mainCategory) => {
        const { _id, name, children } = mainCategory;
        //console.log("subCategories: ", children); //list of subCategories

        let childrenDocs = [];
        if (children && children.length > 0) {
          childrenDocs = await Category.find({ _id: { $in: children } })
            .populate({ path: "children", select: "name _id" })
            .exec();
        }
        // Return the main category with populated children
        return {
          _id,
          name,
          children: childrenDocs,
        };
      })
    );
    // Send the populated main categories
    res.status(200).json(populatedCategories);
  } catch (error) {
    //console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get all products that belong to any category
export const getChildrenProducts = async (req, res) => {
  //Array to store all children categories
  const allChildrenCategories = [];
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await Category.findById(categoryId).exec();
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.children && category.children.length > 0) {
      const childPromises = category.children.map(async (child) => {
        const subCategory = await Category.findById(child._id).exec();

        if (subCategory.children && subCategory.children.length > 0) {
          const subChildPromises = subCategory.children.map(async (child) => {
            const subsubCategory = await Category.findById(child._id).exec();
            return subsubCategory;
          });
          const subsubCategories = await Promise.all(subChildPromises);
          allChildrenCategories.push(...subsubCategories);
        } else {
          allChildrenCategories.push(subCategory);
        }
      });

      await Promise.all(childPromises);
    } else {
      allChildrenCategories.push(category);
    }
    //Find the products that belong to the children categories
    const allProducts = await Promise.all(allChildrenCategories.map(async (category) => {
      const products = await Product.find({ category_id: category._id, status: "active"}).exec();
      return products;
    }));
    //Remove empty arrays in array
    const flattenedProducts = allProducts.flat();

    res.status(200).json(flattenedProducts);
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};