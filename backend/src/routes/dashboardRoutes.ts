import express from 'express';
import { auth } from '../middleware/auth';
import { JobProgress } from '../models/JobProgress';
import Application from '../models/Application';
import Job from '../models/Job';
import Freelancer from '../models/Freelancer';

const router = express.Router();

// Get employer dashboard data
router.get('/employer', auth, async (req: any, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id });
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } });
    const projects = await JobProgress.find({ jobId: { $in: jobIds } });

    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.status === 'open').length,
      totalApplications: applications.length,
      activeProjects: projects.filter((proj: { status: string }) => proj.status === 'in_progress').length,
      completedProjects: projects.filter((proj: { status: string }) => proj.status === 'completed').length
    };

    res.json({
      stats,
      recentJobs: jobs.slice(0, 5),
      recentApplications: applications.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching employer dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get freelancer dashboard data
router.get('/freelancer', auth, async (req: any, res) => {
  try {
    const applications = await Application.find({ freelancerId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    const projects = await JobProgress.find({ freelancerId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    const stats = {
      appliedJobs: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      acceptedApplications: applications.filter(app => app.status === 'accepted').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      activeProjects: projects.filter((proj: { status: string }) => proj.status === 'in_progress').length,
      completedProjects: projects.filter((proj: { status: string }) => proj.status === 'completed').length
    };

    res.json({
      stats,
      applications: applications.slice(0, 5),
      projects: projects.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching freelancer dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

export default router; 