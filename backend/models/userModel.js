import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    balance: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },
    photo_url: {
      type: String,
      default: "",
    },
    is_verified: {
      // Check verify email before checkout
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "banned", "deleted"],
      default: "active",
    },

    validation_token: {
      value: {
        type: String,
      },
      expired_at: {
        type: Date,
      },
    },

    refresh_token: {
      type: String,
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

const User = mongoose.model("User", userSchema);
export default User;
