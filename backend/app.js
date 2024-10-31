import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./configs/database.js";
import jwtAuthenticate from "./middlewares/jwtAuthenticate.js";
import authRoutes from "./routes/authRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js"
import cartRoutes from "./routes/cartRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import fs from 'fs';
import path from 'path';
import swaggerUI from "swagger-ui-express";

dotenv.config();

const app = express();

// Load the Swagger JSON file using fs
const swaggerSpec = JSON.parse(fs.readFileSync(path.resolve('./api-document/swagger.json'), 'utf-8'));

// Connect to MongoDB
connectDB();

app.use(morgan("dev"));

// Middlewares
app.use(
  cors({
    origin: process.env.FE_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api/user", jwtAuthenticate);
app.use("/api/cart", jwtAuthenticate);
app.use("/api/seller", jwtAuthenticate);
app.use("/api/admin", jwtAuthenticate);
app.use("/api/orders",jwtAuthenticate);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));


// Routes
app.use("/api/token", tokenRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders",  orderRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);

export default app;