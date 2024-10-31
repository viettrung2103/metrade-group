import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        if (process.env.NODE_ENV === 'development') {
            console.log('Connected to MongoDB');
        }
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
    }
}

export default connectDB;