import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
      unique: true,
    },
    cart_items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartItem", // Reference to the CartItem model
      },
    ],
    is_active: {
      type: Boolean,
      default: true, // Indicates whether the cart is active
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Automatically add created_at and updated_at
  }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
