import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import Job, { IJob } from '../models/Job';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('employerId', 'name companyName location')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name companyName location');
      
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job (employers only)
router.post('/', auth, requireRole(['employer']), async (req: any, res) => {
  try {
    const job = new Job({
      ...req.body,
      employerId: req.user._id,
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: 'Job creation failed' });
  }
});

// Update job (employer only, own jobs)
router.patch('/:id', auth, requireRole(['employer']), async (req: any, res) => {
  try {
    // Enhanced security: Triple check that user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({ 
        message: 'Only employers can update jobs' 
      });
    }
    
    // Check if job exists and belongs to this employer
    const job = await Job.findOne({ _id: req.params.id, employerId: req.user._id });
    
    if (!job) {
      return res.status(404).json({ 
        message: 'Job not found or you do not have permission to edit this job' 
      });
    }
    
    // Validate job ownership again by comparing IDs as strings
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You do not have permission to edit this job' 
      });
    }
    
    // Prevent updating jobs that are completed or cancelled
    if (job.status === 'completed' || job.status === 'cancelled') {
      return res.status(403).json({ 
        message: 'Cannot edit a job that has been completed or cancelled' 
      });
    }

    const allowedUpdates = ['title', 'description', 'requirements', 'benefits', 'status'] as const;
    type AllowedUpdate = typeof allowedUpdates[number];
    
    const updates = Object.keys(req.body).filter((key): key is AllowedUpdate => 
      allowedUpdates.includes(key as AllowedUpdate)
    );

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }

    updates.forEach(update => {
      job.set(update, req.body[update]);
    });
    
    await job.save();
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({ message: 'Update failed' });
  }
});

// Update job status (specific endpoint for employers)
router.patch('/:id/status', auth, requireRole(['employer']), async (req: any, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const allowedStatuses = ['open', 'closed', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` 
      });
    }
    
    // Enhanced security: Check that user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({ 
        message: 'Only employers can update job status' 
      });
    }
    
    // Check job ownership
    const job = await Job.findOne({ _id: req.params.id, employerId: req.user._id });
    
    if (!job) {
      return res.status(404).json({ 
        message: 'Job not found or you do not have permission to update this job' 
      });
    }
    
    // Additional ownership validation
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You do not have permission to update this job' 
      });
    }
    
    job.status = status;
    await job.save();
    
    res.json({ 
      success: true,
      message: `Job status updated to ${status}`,
      job
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ message: 'Failed to update job status' });
  }
});

// Delete job (employer only, own jobs)
router.delete('/:id', auth, requireRole(['employer']), async (req: any, res) => {
  try {
    // Enhanced security: Check that user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({ 
        message: 'Only employers can delete jobs' 
      });
    }
    
    const job = await Job.findOneAndDelete({ _id: req.params.id, employerId: req.user._id });
    
    if (!job) {
      return res.status(404).json({ 
        message: 'Job not found or you do not have permission to delete this job' 
      });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 