import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    // Validate required fields
    const { email, password, name, role, companyName, skills } = req.body;
    
    // Check required fields
    if (!email || !password || !name || !role) {
      console.error('Missing required fields:', { email: !!email, password: !!password, name: !!name, role: !!role });
      return res.status(400).json({ 
        message: 'Registration failed', 
        error: 'Missing required fields' 
      });
    }

    // Validate role-specific fields
    if (role === 'employer' && !companyName) {
      return res.status(400).json({
        message: 'Registration failed',
        error: 'Company name is required for employers'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('User already exists:', email);
      return res.status(400).json({ 
        message: 'Registration failed', 
        error: 'Email already registered' 
      });
    }

    // Create user with only the fields we want
    const userData = {
      email,
      password,
      name,
      role,
      ...(role === 'employer' && { companyName }),
      ...(skills && { skills: Array.isArray(skills) ? skills : [skills] })
    };

    const user = new User(userData);
    await user.save();
    console.log('User saved successfully:', user);
    
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: 'Registration failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error();
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get profile
router.get('/profile', auth, async (req: any, res) => {
  res.json(req.user);
});

// Update profile
router.patch('/profile', auth, async (req: any, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'name',
    'title',
    'avatar',
    'bio',
    'location',
    'hourlyRate',
    'yearsOfExperience',
    'skills',
    'company',
    'companyName'
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ message: 'Update failed' });
  }
});

export default router; 