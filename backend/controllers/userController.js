import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { hashInput } from "../utils/authUtils/inputHashing.js";
import fs from "fs";

// Profile fetching function
export const profile = async (req, res) => {
  const id = req.user.id;

  // Check if the ID is valid
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User Id",
    });
  }

  try {
    const userInfo = await User.findById(id, "_id first_name last_name email role photo_url is_verified phone balance");

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User Information not found",
      });
    }

    const userObject = userInfo.toObject();
    res.status(200).json({
      success: true,
      message: "User Info found",
      user: { ...userObject },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Profile updating function
export const updateProfile = async (req, res) => {
  const id = req.user.id;
  const { first_name, last_name, phone, current_password, new_password } = req.body;
  const photo_url = req.file ? req.file.filename : null;

  // Check if the ID is valid
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User Id",
    });
  }

  try {
    // Fetch the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If the user is changing the password
    if (current_password && new_password) {
      const isPasswordCorrect = await bcrypt.compare(current_password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash the new password
      user.password = await hashInput(new_password);
    }

    // Update other fields
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone) user.phone = phone;

    // Update the photo URL if a new photo is uploaded
    if (photo_url) {
      // Delete the old photo if it exists
      if (user.photo_url && fs.existsSync(`${process.env.UPLOAD_FOLDER_PATH}/${user.photo_url}`)) {
        fs.unlinkSync(`${process.env.UPLOAD_FOLDER_PATH}/${user.photo_url}`);
      }
      user.photo_url = `${process.env.USER_AVATAR_UPLOAD_PATH}/${photo_url}`;
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User Info updated",
      user: {
        _id: updatedUser._id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        role: updatedUser.role,
        photo_url: updatedUser.photo_url,
        is_verified: updatedUser.is_verified,
        phone: updatedUser.phone,
        balance: updatedUser.balance,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

};

