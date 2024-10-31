import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/token/jwtToken.js";
import { convertTimeToMilliseconds } from "../utils/time/time.js";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";

export const getAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "No refresh token provided" });
  }
  // Verify the refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }
    const { id: userId } = decoded;

    const user = await User.findById(userId);
    const card = await Cart.findOne({ user_id: user._id });

    const newAcessToken = generateAccessToken(userId);
    const tokenMaxAge = convertTimeToMilliseconds(
      process.env.JWT_ACCESS_EXPIRES_IN
    );

    res.cookie("accessToken", newAcessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api",
      maxAge: tokenMaxAge,
    });

    res.status(200).json({
      success: true,
      message: "New access token generated",
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        photo_url: user.photo_url,
        is_verified: user.is_verified,
        phone: user.phone,
        balance: user.balance,
        card_id: card?._id,
        token_expired_at: Date.now() + tokenMaxAge,
      },
    });
  });
};
