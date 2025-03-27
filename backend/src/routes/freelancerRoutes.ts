import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import User from '../models/User';
import Freelancer from '../models/Freelancer';

const router = express.Router();

// Get all freelancers with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      location,
      skills,
      minExperience,
      maxExperience,
      minRate,
      maxRate,
      page = 1,
      limit = 9
    } = req.query;

    console.log('Query Parameters:', req.query);

    // Start with an empty query to get all freelancers if no filters are applied
    const query: any = {};

    // Search by name or title
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by location
    if (location && typeof location === 'string' && location.trim() !== '') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by skills (ensure it's an array)
    if (skills && Array.isArray(skills) && skills.length > 0) {
      query.skills = { $in: skills };
    }

    // Filter by experience range - only if values are different from default
    if (
      (minExperience && minExperience !== '0') || 
      (maxExperience && maxExperience !== '15')
    ) {
      query.yearsOfExperience = {};
      if (minExperience) query.yearsOfExperience.$gte = Number(minExperience);
      if (maxExperience) query.yearsOfExperience.$lte = Number(maxExperience);
    }

    // Filter by hourly rate range - only if values are different from default
    if (
      (minRate && minRate !== '500') || 
      (maxRate && maxRate !== '10000')
    ) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    console.log('MongoDB Query:', query);

    // Debug: Count all freelancers without any filters
    const totalFreelancers = await Freelancer.countDocuments({});
    console.log('Total freelancers in database (no filters):', totalFreelancers);

    const skip = (Number(page) - 1) * Number(limit);

    const freelancers = await Freelancer.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    console.log('Found Freelancers:', freelancers.length);
    console.log('Sample of first freelancer if exists:', freelancers[0]);

    const total = await Freelancer.countDocuments(query);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      data: freelancers,
      total,
      totalPages,
      currentPage: Number(page),
      itemsPerPage: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({ message: 'Failed to fetch freelancers' });
  }
});

// Create freelancer profile
router.post('/', auth, requireRole(['freelancer']), async (req: any, res) => {
  try {
    console.log('Creating freelancer profile with data:', req.body);
    console.log('User ID from auth:', req.user._id);

    // Create new freelancer profile
    const freelancer = new Freelancer({
      ...req.body,
      userId: req.user._id
    });

    console.log('Freelancer document before save:', freelancer);
    
    await freelancer.save();
    console.log('Freelancer saved successfully:', freelancer._id);

    // Update user with freelancer reference
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { freelancerId: freelancer._id },
      { new: true }
    );
    console.log('User updated with freelancerId:', updatedUser);

    res.status(201).json(freelancer);
  } catch (error) {
    console.error('Error creating freelancer profile:', error);
    res.status(400).json({ message: 'Failed to create profile' });
  }
});

// Get freelancer profile by ID
router.get('/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.json(freelancer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update freelancer profile
router.patch('/:id', auth, requireRole(['freelancer']), async (req: any, res) => {
  try {
    const freelancer = await Freelancer.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    Object.assign(freelancer, req.body);
    await freelancer.save();
    
    res.json(freelancer);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});

export default router; 