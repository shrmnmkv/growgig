import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import userRoutes from './routes/userRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import freelancerRoutes from './routes/freelancerRoutes';
import employerRoutes from './routes/employerRoutes';
import uploadRoutes from './routes/uploadRoutes';
import jobProgressRoutes from './routes/jobProgressRoutes';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:5002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/job-progress', jobProgressRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/giggle-connect')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 