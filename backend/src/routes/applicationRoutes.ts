import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import Application from '../models/Application';
import Job from '../models/Job';
import { JobProgress } from '../models/JobProgress';

const router = express.Router();

// Create application (freelancers only)
router.post('/', auth, requireRole(['freelancer']), async (req: any, res) => {
  try {
    const job = await Job.findById(req.body.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      jobId: req.body.jobId,
      freelancerId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      ...req.body,
      freelancerId: req.user._id,
    });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: 'Application failed' });
  }
});

// Get my applications (freelancer only)
router.get('/mine', auth, requireRole(['freelancer']), async (req: any, res) => {
  try {
    const applications = await Application.find({ freelancerId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for a job (employer only, own jobs)
router.get('/job/:jobId', auth, requireRole(['employer']), async (req: any, res) => {
  try {
    // First verify the job exists and belongs to the employer
    const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or you are not authorized to view it' });
    }

    // Only fetch applications for the employer's job
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('freelancerId', 'name email skills bio')
      .populate('jobId', 'title company location type')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single application (employer of the job or the freelancer who applied)
router.get('/:id', auth, async (req: any, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('freelancerId', 'name email skills bio')
      .populate('jobId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is authorized to view this application
    const job = application.jobId as any;
    const isEmployer = job.employerId.toString() === req.user._id.toString();
    const isFreelancer = application.freelancerId._id.toString() === req.user._id.toString();

    // Check if user has permission to view this application
    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    // Verify user role matches their access level
    if (isEmployer && req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can view applications for their jobs' });
    }

    if (isFreelancer && req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only the applicant can view their own application' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (employer only, own jobs)
router.patch('/:id/status', auth, requireRole(['employer']), async (req: any, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = application.jobId as any;
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    // Validate status
    if (!['accepted', 'rejected'].includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});

export default router; 