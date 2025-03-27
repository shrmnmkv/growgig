import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/giggle-connect');
    console.log('Connected to MongoDB');

    // Get the users collection
    const usersCollection = mongoose.connection.collection('users');

    // Drop the username index
    await usersCollection.dropIndex('username_1');
    console.log('Successfully dropped username index');

    // List remaining indexes
    const indexes = await usersCollection.indexes();
    console.log('Remaining indexes:', indexes);

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

dropIndexes(); 