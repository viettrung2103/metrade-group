// import { initializeServer, closeServer } from './setupTestServer';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';
import dotenv from 'dotenv';
import app from '../app';
import mongoose from 'mongoose';

dotenv.config();

// Increase the timeout for the test to 30 seconds
jest.setTimeout(30000);

// Mock user data
const mockUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test.user1@metropolia.fi',
    phone: '123456789',
    balance: 1000,
    password: bcrypt.hashSync('12345678', parseInt(process.env.SALT_ROUNDS)),
    role: 'user',
    photo_url: '',
    is_verified: true,
    status: 'active',
};

let accessToken;
let appServer;

beforeAll(async () => {
    // Start the server and return the appServer
    appServer = app.listen(0);

    // Insert the mock user into the database
    await User.create(mockUser);

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
    await User.deleteMany({ email: mockUser.email });
    mongoose.connection.close();
    appServer.close();
});

describe('User API Tests', () => {

    // Test the profile fetching functionality
    it('should return 200 for fetching user info', async () => {
        const res = await request(appServer)
            .get('/api/user/profile/detail')
            .set('Cookie', [accessToken]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toEqual(mockUser.email);
        expect(res.body.user.first_name).toEqual(mockUser.first_name);
        expect(res.body.user.last_name).toEqual(mockUser.last_name);
    });

    // Test the profile updating functionality
    it('should update user profile and return 200', async () => {
        const updatedData = {
            first_name: 'UpdatedFirst',
            last_name: 'UpdatedLast',
            phone: '987654321',
        };

        const res = await request(appServer)
            .patch('/api/user/profile/update')
            .set('Cookie', [accessToken])
            .send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.first_name).toEqual(updatedData.first_name);
        expect(res.body.user.last_name).toEqual(updatedData.last_name);
        expect(res.body.user.phone).toEqual(updatedData.phone);
    });

    // Test password updating functionality
    it('should update user password and return 200', async () => {
        const passwordUpdateData = {
            current_password: '12345678',
            new_password: 'newpassword123',
        };

        const res = await request(appServer)
            .patch('/api/user/profile/update')
            .set('Cookie', [accessToken])
            .send(passwordUpdateData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        const loginRes = await request(appServer).post('/api/auth/login').send({
            email: mockUser.email,
            password: 'newpassword123',
        });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 if cookies are not provided', async () => {
        const res = await request(appServer).get('/api/user/profile/detail');

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toEqual('No access token provided');
    });

});
