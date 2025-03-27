import express from 'express';
import User from '../models/User';
import Job from '../models/Job';

const router = express.Router();

// Get platform statistics
router.get('/', async (req, res) => {
  try {
    const [totalJobs, totalFreelancers, totalCompanies] = await Promise.all([
      Job.countDocuments({ status: 'open' }),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'employer' })
    ]);

    res.json({
      totalJobs,
      totalFreelancers,
      totalCompanies,
      totalCategories: 10 // Hardcoded for now, can be made dynamic later
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 