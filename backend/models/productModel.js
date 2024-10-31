import mongoose from "mongoose";

const arrayLimit = (val) => {
  return val.length <= 4;
};

const productSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // Trims whitespace from the start and end of the string
    },
    image: {
      type: String,
      required: true,
    },
    photos: {
      type: [String], // Array of strings to store photo URLs
      validate: [arrayLimit, "Exceeds the limit of 4 photos"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Ensures price is not negative
    },
    pickup_point: {
      type: String,
      enum: ["Myllypuro", "Karamalmi", "Myyrmäki"],
      trim: true,
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      required: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["processing", "active", "sold"],
      default: "processing",
    },

    deleted_at: {
      type: Date,
      default: null,
    },

    keywords: {
      type: [String], // Array of keywords associated with the product
      default: [], // Default to an empty array
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Automatically add created_at and updated_at
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
