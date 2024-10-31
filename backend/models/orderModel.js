import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },

    total_item_quantity: {
      type: Number,
      required: true,
      min: 0, // Ensures the quantity is not negative
    },
    total_price: {
      type: Number,
      required: true,
      min: 0, // Ensures the price is not negative
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Automatically add created_at and updated_at
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
