import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import { emailCheck } from "../utils/authUtils/emailValidation.js";
import { hashInput } from "../utils/authUtils/inputHashing.js";
import { sendConfirmationEmailService } from "../utils/authUtils/emailSender.js";
import {
  createToken,
  isValidVerifyToken,
} from "../utils/authUtils/tokenValidation.js";
import { convertTimeToMilliseconds } from "../utils/time/time.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token/jwtToken.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    //email and password
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: `Missing information`,
      });
    }
    if (!emailCheck(email)) {
      return res.status(400).json({
        status: "fail",
        message: `Invalid email format`,
      });
    } else {
      //check if the user with email exist
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          status: "fail",
          message: `The email ${email} is already used`,
        });
      } else {
        // if not exist, create a new user , and a new cart with new user id
        const hashedPassword = await hashInput(password);
        const validation_token = await createToken(email);

        // send confirmation email
        // need to turn this off while testing auth.test.js but working with normal email
        await sendConfirmationEmailService(
          first_name,
          email,
          validation_token.value
        );

        const newUser = await User.create({
          first_name,
          last_name,
          email,
          password: hashedPassword,
          validation_token,
        });
        const newCart = await Cart.create({ user_id: newUser.id });

        // return response to FE
        return res.status(201).json({
          status: "success",
          data: {
            user: newUser,
            cart: newCart,
          },
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Cannot Register. Please try again later",
    });
  }
};

export const checkVerify = async (req, res) => {
  try {
    const { token, email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "an account with this email does not exist",
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        status: "fail",
        message: "User is already verified",
      });
    }

    const validToken = await isValidVerifyToken(token, user);
    if (validToken) {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            is_verified: true,
            role: "seller",
            validation_token: {
              value: "",
              expired_at: user.validation_token.expired_at,
            },
          },
        },
        { returnDocument: "after" }
      );

      return res.status(200).json({
        status: "success",
        data: {
          message: "Email verified successfully",
          updatedUser,
        },
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message:
          "Email verification failed, possibly the link is invalid or expired\nPlease request new verification link.",
      });
    }
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const resendEmail = async (req, res) => {
  const { email } = req.body;
  try {
    //check contain email in res
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is missing",
      });
    }
    // check email format
    else if (!emailCheck(email)) {
      return res.status(400).json({
        status: "fail",
        message: "wrong email format",
      });
    } else {
      //check if the user with email exist
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: "fail",
          message:
            "an account with this email does not exist. Please register!",
        });

        //create token and update user to db and send email
      } else if (user.is_verified) {
        return res.status(400).json({
          status: "fail",
          message: "user is already verified",
        });
      } else {
        const validation_token = await createToken(email);
        const updatedUser = await User.findOneAndUpdate(
          { email },
          {
            $set: { validation_token },
          },
          { returnDocument: "after" }
        );

        // need to turn this off while testing auth.test.js but working with normal email
        sendConfirmationEmailService(
          user.first_name,
          email,
          validation_token.value
        );

        return res.status(201).json({
          status: "success",
          data: updatedUser,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message:
        "Cannot send resend email. Please wait a for 10 minutes and try again",
    });
  }
};

//Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  // If email and password are not included
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password must be included" });
  }

  try {
    const user = await User.findOne({ email: email });

    // If invalid email or password
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    // If email and password are correct, send res with token

    //generate refreshToken and store in cookies and database
    const newRefreshToken = generateRefreshToken(user._id);
    const savedToken = await User.findByIdAndUpdate(user._id, {
      refresh_token: newRefreshToken,
    });

    if (!savedToken) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/token/get-access-token",
      maxAge: convertTimeToMilliseconds(process.env.JWT_REFRESH_EXPIRES_IN),
    });

    //generate accessToken and store in cookies
    const newAccessToken = generateAccessToken(user._id);
    const accessTokenMaxAge = convertTimeToMilliseconds(
      process.env.JWT_ACCESS_EXPIRES_IN
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api",
      maxAge: accessTokenMaxAge,
    });

    const card = await Cart.findOne({ user_id: user._id });

    res.status(200).json({
      success: true,
      message: "Login successful",
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
        token_expired_at: Date.now() + accessTokenMaxAge,
      },
    });
  } catch (error) {
    console.log(error);
    // Handle any server errors
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Logout action
export const logout = async (req, res) => {
  const { userId } = req.body;

  try {
    // Clear the refresh token in the database
    const deletedToken = await User.findByIdAndUpdate(userId, {
      refresh_token: "",
    });

    if (deletedToken) {
      // Clear the tokens from the cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/api/token/get-access-token",
      });

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/api",
      });

      return res
        .status(200)
        .json({ success: true, message: "Logout successfully" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Error during logout" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
