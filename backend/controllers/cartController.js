import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

//ADD PRODUCT TO CART
export const addCartItem = async (req, res) => {
  const product = req.body.product;
  const addingQuantity = req.body.adding_quantity;

  if (!product || !mongoose.Types.ObjectId.isValid(product._id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Product Id",
    });
  }

  if (!addingQuantity || addingQuantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid adding quantity",
    });
  }

  const userId = req.user.id;
  // Find or create a new cart for the user
  let cart = await Cart.findOne({ user_id: userId }).populate({
    path: "cart_items",
  });

  //If no cart exists, create a new one
  if (!cart) {
    cart = await Cart.create({ user_id: userId });

    if (!cart) {
      return res.status(500).json({
        success: false,
        message: "Fail to create new cart",
      });
    }
  }

  //If there is a cart with this user_id

  let cartItem = cart.cart_items.find((item) =>
    item.product_id.equals(product._id)
  );

  // if the product is already in the cart, adding quantity
  if (cartItem) {
    if (addingQuantity <= cartItem.limit_quantity) {
      const newQuantity = cartItem.adding_quantity + addingQuantity;
      const updatedCartItem = await CartItem.findByIdAndUpdate(
        cartItem._id,
        {
          adding_quantity: newQuantity,
          limit_quantity: cartItem.limit_quantity - addingQuantity,
          sub_total: newQuantity * product.price,
        },
        { new: true }
      );

      if (updatedCartItem) {
        return res.status(200).json({
          success: true,
          message: "Add product to cart successfully",
          limit_quantity: updatedCartItem.limit_quantity,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to add product to cart",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Adding number exceeds limit quantity",
      });
    }
  }

  // if the product is not included in the cart, create new cart item
  if (!cartItem) {
    cartItem = await CartItem.create({
      cart_id: cart._id,
      product_id: product._id,
      adding_quantity: addingQuantity,
      limit_quantity: product.stock_quantity - addingQuantity,
      sub_total: addingQuantity * product.price,
    });

    if (!cartItem) {
      return res.status(500).json({
        success: false,
        message: "Fail to add to cart",
      });
    }

    cart.cart_items.push(cartItem._id);
    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id,
      { cart_items: cart.cart_items },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(500).json({
        success: false,
        message: "Fail to update cart with new cart item",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Add product to cart successfully",
      limit_quantity: cartItem.limit_quantity,
    });
  }
};

// GET CART ITEM INFO
export const getCartItem = async (req, res) => {
  const userId = req.user.id;
  const productId = req.body.product_id;

  //if no valid productId
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }
  try {
    //find Cart info with userId
    const cart = await Cart.findOne({ user_id: userId }).populate({
      path: "cart_items",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No valid cart",
      });
    }
    //check if there is any cart item that has productId
    if (cart) {
      const cartItem = cart.cart_items.find((item) =>
        item.product_id.equals(productId)
      );
      if (cartItem) {
        return res.status(200).json({
          success: true,
          message: "Get cart item info successfully",
          cartItem: cartItem,
        });
      }
      return res.status(404).json({
        success: false,
        message: "No valid cart item",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET CART AND ALL OF CART ITEM INCLUDED
export const getCartDetail = async (req, res) => {
  const userId = req.user.id;
  try {
    const cartDetail = await Cart.findOne({ user_id: userId }).populate({
      path: "cart_items",
      populate: {
        path: "product_id",
        select: "name image pickup_point price stock_quantity",
      },
    });
    if (cartDetail) {
      return res.status(200).json({
        success: true,
        message: "Get cart item info successfully",
        cart_detail: cartDetail,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Fail to get cart item",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

//UPDATE ADDING QUANTITY (when click button + -)
export const updateItemQuantity = async (req, res) => {
  const itemId = req.body.cart_item.id;
  const updatedQuantity = req.body.cart_item.quantity;
  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId) || !updatedQuantity) {
    return res.status(400).json({
      message: "Bad request! Invalid Item Id or Lack of quantity",
    });
  }
  try {
    const cartItem = await CartItem.findById(itemId).populate({
      path: "product_id",
      model: "Product",
    });
    if (
      (updatedQuantity === -1 && cartItem.adding_quantity >= 2) ||
      (updatedQuantity === 1 && cartItem.limit_quantity >= 1)
    ) {
      const updatedCartItem = await CartItem.findByIdAndUpdate(
        itemId,
        {
          adding_quantity: cartItem.adding_quantity + updatedQuantity,
          limit_quantity: cartItem.limit_quantity - updatedQuantity,
          sub_total:
            (cartItem.adding_quantity + updatedQuantity) *
            cartItem.product_id.price,
        },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Updated quantity successfully",
        cart_item: updatedCartItem,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Update quantity exceeds the limit",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteItem = async (req, res) => {
  const itemId = req.params.id;
  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Item Id",
    });
  }
  try {
    const deletedItem = await CartItem.findByIdAndDelete(itemId);
    if (deletedItem) {
      return res.status(200).json({
        success: true,
        message: "Delete cart item successfully",
        deleted_item: deletedItem,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Fail to delete cart item",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//CHECKOUT

export const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const checkout = req.body.checkout;
    const userId = req.user.id;

    if (!checkout) {
      return res.status(400).json({
        success: false,
        message: "Lacking of Checkout Info",
      });
    }

    const user = await User.findById(userId).session(session);
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Check if user has enough balance
    if (user.balance < checkout.total_price) {
      return res.status(402).json({
        success: false,
        message: "Not enough balance",
      });
    }
    // Check if cart exists
    const cart = await Cart.findOne({ user_id: userId })
      .populate({
        path: "cart_items",
        populate: {
          path: "product_id",
          model: "Product",
        },
      })
      .session(session);

    let cartItems = cart.cart_items.filter((item) => {
      return checkout.order_items.some(
        (orderItem) => orderItem._id === item._id.toString()
      );
    });

    if (!cart || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No cart or cart items found for checkout",
      });
    }

    // 1-Create the Order document
    const newOrder = new Order({
      user_id: userId,
      total_item_quantity: checkout.total_items,
      total_price: checkout.total_price,
    });
    const savedOrder = await newOrder.save({ session });

    // 2-Create OrderItem documents for each selected cart item
    const orderItems = cartItems.map((item) => ({
      order_id: savedOrder._id,
      product_id: item.product_id._id,
      product_name: item.product_id.name,
      image: item.product_id.image,
      sold_quantity: item.adding_quantity,
      price: item.product_id.price,
      pickup_point: item.product_id.pickup_point,
      sub_total: item.sub_total,
    }));

    await OrderItem.insertMany(orderItems, { session });

    // 3-Update stock quantity of each product
    for (const item of cartItems) {
      const product = await Product.findById(item.product_id._id).session(
        session
      );
      if (product) {
        // if product is in processing, rollback the transaction
        if (product.status === "processing") {
          const updatedcart = await Cart.findByIdAndUpdate(
            cart._id,
            {
              $pull: { cart_items: item._id },
            },
            { new: true }
          );
          await CartItem.findByIdAndDelete(item._id);
          await session.abortTransaction();
          session.endSession();
          return res.status(422).json({
            success: false,
            message: `Product:" ${product.name}" is in processing`,
            updatedCart: updatedcart,
          });
        }
        product.stock_quantity -= item.adding_quantity;
        if (product.stock_quantity === 0) {
          product.status = "sold";
        }
        if (product.stock_quantity < 0) {
          // If stock goes negative, rollback the transaction
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: `Not enough stock for product: "${product.name}"`,
          });
        }
        await product.save({ session });
      }
    }

    //4-Remove items that are checked out from the cartItem
    const cartItemIds = cartItems.map((item) => item._id);
    await CartItem.deleteMany({ _id: { $in: cartItemIds } }, { session });

    // 5-Remove the checked-out cart items from the Cart
    await Cart.findByIdAndUpdate(
      cart._id,
      {
        $pull: { cart_items: { $in: cartItemIds }, new: true },
      },
      { session }
    );

    //6-Deduct money from balance of the buyer
    user.balance -= checkout.total_price;
    const updatedUser = await user.save({ session });
    if (!updatedUser) {
      throw new Error("Failed to update user balance");
    }

    console.log("User balance after deduction:", updatedUser.balance);

    //7-Increase money of the seller of each product
    for (const item of cartItems) {
      const seller = await User.findById(item.product_id.user_id).session(
        session
      );
      if (seller) {
        seller.balance += item.sub_total;
        await seller.save({ session });
      } else {
        throw new Error("Seller not found");
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Checkout successful and stock updated",
      order: savedOrder,
      user: updatedUser,
    });
  } catch (error) {
    // If any error, abort the transaction
    await session.abortTransaction();
    session.endSession();

    console.error("Error during checkout:", error);
    res.status(500).json({
      success: false,
      message: "Error during checkout",
      error: error.message,
    });
  }
};
