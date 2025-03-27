import express from 'express';
import { auth } from '../middleware/auth';
import User from '../models/User';
import Job from '../models/Job';

const router = express.Router();

// Get all employers with search and filters
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    // Build query
    const query: any = { role: 'employer' };
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    // Get employers
    const employers = await User.find(query)
      .select('name companyName location industry companySize description logo')
      .lean();

    // Get open positions count for each employer
    const employersWithJobs = await Promise.all(
      employers.map(async (employer) => {
        const openPositions = await Job.countDocuments({
          employerId: employer._id,
          status: 'open'
        });
        return {
          ...employer,
          openPositions
        };
      })
    );

    res.json(employersWithJobs);
  } catch (error) {
    console.error('Error fetching employers:', error);
    res.status(500).json({ message: 'Failed to fetch employers' });
  }
});

// Get employer by ID
router.get('/:id', async (req, res) => {
  try {
    const employer = await User.findOne({ _id: req.params.id, role: 'employer' })
      .select('name companyName location industry companySize description logo')
      .lean();

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Get open jobs count
    const openPositions = await Job.countDocuments({
      employerId: employer._id,
      status: 'open'
    });

    res.json({
      ...employer,
      openPositions
    });
  } catch (error) {
    console.error('Error fetching employer:', error);
    res.status(500).json({ message: 'Failed to fetch employer' });
  }
});

// Update employer profile (protected route)
router.patch('/:id', auth, async (req: any, res) => {
  try {
    // Only allow updating own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const updates = req.body;
    const employer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'employer' },
      { $set: updates },
      { new: true }
    ).select('name companyName location industry companySize description logo');

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    res.json(employer);
  } catch (error) {
    console.error('Error updating employer profile:', error);
    res.status(500).json({ message: 'Failed to update employer profile' });
  }
});

export default router; 