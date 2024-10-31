// import { initializeServer, closeServer } from './setupTestServer';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/userModel';
import Cart from '../models/cartModel';
import CartItem from '../models/cartItemModel';
import Category from '../models/categoryModel';
import Product from '../models/productModel';
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";

dotenv.config();

// Increase the timeout for the test to 30 seconds
jest.setTimeout(30000);

// Mock user data
const mockUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test.user.cart@metropolia.fi',
    phone: '1234567891',
    balance: 1000,
    password: bcrypt.hashSync('12345678', parseInt(process.env.SALT_ROUNDS)),
    role: 'user',
    photo_url: '',
    is_verified: true,
    status: 'active',
};

const mockCategory = {
    name: 'Test Category',
    description: 'This is a test category',
    parent_id: null,
    ancestors: [],
    children: [],
    is_active: true,
};

// Mock product data
const mockProduct = {
    user_id: '',
    name: 'Test Product',
    image: 'test.jpg',
    photos: [],
    description: 'This is a test product',
    price: 10,
    pickup_point: 'Myllypuro',
    category_id: '',
    stock_quantity: 1000,
    status: 'active',
};

let accessToken;
let appServer;

beforeAll(async () => {
    // Start the server and return the appServer
    appServer = app.listen(0);

    // Insert the mock user into the database
    const user = await User.create(mockUser);
    mockProduct.user_id = user._id;

    const category = await Category.create(mockCategory);
    mockProduct.category_id = category

    const product = await Product.create(mockProduct);
    mockProduct._id = product._id;

    // Simulate login to get access token
    const res = await request(appServer).post('/api/auth/login').send({
        email: mockUser.email,
        password: '12345678',
    });

    // Get the access token
    // 0: Is the refreshToken, 1: Is the accessToken
    accessToken = res.headers['set-cookie'][1];
});

afterAll(async () => {
    // Clean up the database by removing the mock user
    const user = await User.findOne({ email: mockUser.email });

    if (user) {
        // Clean up Cart and CartItems related to the mock user
        await Cart.deleteMany({ user_id: user._id });
        await CartItem.deleteMany({ cart_id: { $in: (await Cart.find({ user_id: user._id })).map(cart => cart._id) } });

        // Clean up Orders and OrderItems related to the mock user
        const orderIds = (await Order.find({ user_id: user._id })).map(order => order._id);
        
        // Clean up OrderItems first, as they reference the Order
        await OrderItem.deleteMany({ order_id: { $in: orderIds } });

        // Clean up Orders
        await Order.deleteMany({ user_id: user._id });

        // Clean up other test data (User, Category, Product)
        await User.deleteMany({ email: mockUser.email });
        await Category.deleteMany({ name: mockCategory.name });
        await Product.deleteMany({ user_id: user._id });
    }

    mongoose.connection.close();
    appServer.close();
});

describe('Cart API Test', () => {
    it('should add a product to the cart', async () => {
        const res = await request(appServer)
            .post('/api/cart/add-cart-item')
            .send({
                product: mockProduct,
                adding_quantity: 1,
            })
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('shouldn\' add a product to the cart with invalid product', async () => {
        const res = await request(appServer)
            .post('/api/cart/add-cart-item')
            .send({
                product: 'invalid product',
                adding_quantity: 100,
            })
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    it('should\'t add a product to the cart with invalid quantity', async () => {
        const res = await request(appServer)
            .post('/api/cart/add-cart-item')
            .send({
                product: mockProduct,
                adding_quantity: -1,
            })
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    it('should get the cart details', async () => {
        const res = await request(appServer)
            .get('/api/cart/get-cart-detail')
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should get the cart item', async () => {
        const res = await request(appServer)
            .post('/api/cart/get-cart-item')
            .send({
                product_id: mockProduct._id,
            })
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('shouldn\'t get the cart item with invalid product id', async () => {
        const res = await request(appServer)
            .post('/api/cart/get-cart-item')
            .send({
                product_id: 'invalid product id',
            })
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    it('should update the quantity of the cart item', async () => {
        // Add the product to the cart
        await request(appServer)
            .post('/api/cart/add-cart-item')
            .send({
                product: mockProduct,
                adding_quantity: 1,
            })
            .set('Cookie', [accessToken]);

        const cartDetail = await request(appServer)
            .get('/api/cart/get-cart-detail')
            .set('Cookie', [accessToken]);

        let cartItems;
        if (cartDetail.body.cart_detail.cart_items.length > 0) {
            cartItems = cartDetail.body.cart_detail.cart_items;
        }

        const res = await request(appServer)
            .post('/api/cart/update-quantity')
            .send({
                cart_item: {
                    id: cartItems[0]._id,
                    quantity: 1,
                }
            })
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('shouldn\'t update the quantity of the cart item with invalid cart item id', async () => {
        const res = await request(appServer)
            .post('/api/cart/update-quantity')
            .send({
                cart_item: {
                    id: 'invalid cart item id',
                    quantity: 1,
                }
            })
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(400);
    });

    it('should delete the cart item', async () => {
        // Add the product to the cart
        await request(appServer)
            .post('/api/cart/add-cart-item')
            .send({
                product: mockProduct,
                adding_quantity: 1,
            })
            .set('Cookie', [accessToken]);

        const cartDetail = await request(appServer)
            .get('/api/cart/get-cart-detail')
            .set('Cookie', [accessToken]);

        let cartItems;
        if (cartDetail.body.cart_detail.cart_items.length > 0) {
            cartItems = cartDetail.body.cart_detail.cart_items;
        }

        const res = await request(appServer)
            .delete(`/api/cart/delete-cart-item/${cartItems[0]._id}`)
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('shouldn\'t delete the cart item with invalid cart item id', async () => {
        const res = await request(appServer)
            .delete('/api/cart/delete-cart-item/invalid cart item id')
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(400);
    });

    it('should checkout the cart', async () => {
        // Add the product to the cart
        await request(appServer)
            .post('/api/cart/add-cart-item')
            .send({
                product: mockProduct,
                adding_quantity: 1,
            })
            .set('Cookie', [accessToken]);

        const cartDetailRes = await request(appServer)
            .get('/api/cart/get-cart-detail')
            .set('Cookie', [accessToken]);

        const cartDetail = cartDetailRes.body.cart_detail;

        const res = await request(appServer)
            .post('/api/cart/checkout')
            .send({
                checkout: {
                    order_items: cartDetail.cart_items,
                    total_items: 1,
                    total_price: 10,
                }
            })
            .set('Cookie', [accessToken]);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

});
