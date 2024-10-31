import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import { isValidId } from "../utils/dbUtils.js";
import { json } from "express";

export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid User Id",
      });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { id, status, pickup, page } = req.query;
    const currentPage = page || 1;
    const limit = 5;
    const skip = (currentPage - 1) * limit;

    const pipeline = [
      { $match: { user_id: userObjectId } },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "order_id",
          as: "order_detail_list",
        },
      },

      { $sort: { updated_at: -1 } },
      { $unwind: "$order_detail_list" },
      { $replaceRoot: { newRoot: "$order_detail_list" } },
    ];
    if (pickup) {
      pipeline.push({
        $match: { pickup_point: pickup },
      });
    }
    if (id) {
      pipeline.push({
        //because id is of any type so show error, put as interpolate
        $match: { order_id: new mongoose.Types.ObjectId(`${id}`) },
      });
    }
    if (status) {
      pipeline.push({
        $match: {
          selling_status: status,
        },
      });
    }

    pipeline.push({
      $facet: {
        totalCountArr: [{ $count: "totalCount" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const orderItemList = await Order.aggregate(pipeline);

    const { totalCountArr, data } = orderItemList[0];
    let totalNum = 0;
    if (totalCountArr.length > 0) {
      totalNum = totalCountArr[0].totalCount;
    }

    res.status(200).json({
      status: "success",
      data: {
        totalOrder: totalNum,
        limit: limit,
        orderItemList: data,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
