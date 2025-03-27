import express from 'express';
import { auth } from '../middleware/auth';
import { JobProgress } from '../models/JobProgress';
import { IApplication } from '../models/Application';
import Application from '../models/Application';
import Job from '../models/Job';
import { IUser } from '../models/User';
import mongoose from 'mongoose';
import { Request } from 'express';

const router = express.Router();

// Update the request type to include user
interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
    role: string;
    name?: string;
    email?: string;
  };
}

// Initialize job progress when an application is accepted
router.post('/initialize', auth, async (req: AuthRequest, res) => {
  try {
    const { applicationId, milestones, expectedEndDate } = req.body;
    const application = await Application.findById(applicationId).populate('jobId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Calculate total amount from milestones
    const totalAmount = milestones.reduce((sum: number, milestone: any) => sum + milestone.amount, 0);

    const jobProgress = new JobProgress({
      applicationId: application._id,
      jobId: application.jobId,
      freelancerId: application.freelancerId,
      employerId: job.employerId,
      status: 'in_progress',
      milestones: milestones.map((milestone: any) => ({
        ...milestone,
        status: 'pending'
      })),
      startDate: new Date(),
      expectedEndDate: new Date(expectedEndDate),
      totalAmount,
      amountPaid: 0
    });

    await jobProgress.save();
    res.status(201).json(jobProgress);
  } catch (error) {
    console.error('Error initializing job progress:', error);
    res.status(500).json({ message: 'Error initializing job progress' });
  }
});

// Get job progress by ID
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const jobProgress = await JobProgress.findById(req.params.id);
    
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Check if user is authenticated
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has access to this job progress
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    const isFreelancer = jobProgress.freelancerId.equals(req.user._id);

    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(jobProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job progress' });
  }
});

// Update job progress
router.patch('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const jobProgress = await JobProgress.findById(req.params.id);
    
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Check if user is authenticated
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has access to this job progress
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    const isFreelancer = jobProgress.freelancerId.equals(req.user._id);

    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If updating milestones, only allow employer to do so
    if (req.body.milestones && !isEmployer) {
      return res.status(403).json({ message: 'Only employers can update milestones' });
    }

    // Calculate total amount if milestones are being updated
    if (req.body.milestones) {
      jobProgress.totalAmount = req.body.milestones.reduce(
        (sum: number, milestone: any) => sum + milestone.amount,
        0
      );
      jobProgress.milestones = req.body.milestones;
    }

    // Update other fields if present
    if (req.body.status) jobProgress.status = req.body.status;
    if (req.body.expectedEndDate) jobProgress.expectedEndDate = req.body.expectedEndDate;
    if (req.body.actualEndDate) jobProgress.actualEndDate = req.body.actualEndDate;

    jobProgress.updatedAt = new Date();
    await jobProgress.save();
    
    res.json(jobProgress);
  } catch (error) {
    console.error('Error updating job progress:', error);
    res.status(500).json({ message: 'Error updating job progress' });
  }
});

// Get all job progress for a user
router.get('/my-progress', auth, async (req: AuthRequest, res) => {
  try {
    const jobProgresses = await JobProgress.find({
      $or: [
        { employerId: req.user?._id },
        { freelancerId: req.user?._id }
      ]
    });
    res.json(jobProgresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job progress' });
  }
});

// Get job progress by application ID
router.get('/application/:applicationId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const jobProgress = await JobProgress.findOne({ applicationId: req.params.applicationId })
      .populate('jobId', 'title company location type')
      .populate('freelancerId', 'name email');
    
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Check if user has access to this job progress
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    const isFreelancer = jobProgress.freelancerId.equals(req.user._id);

    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(jobProgress);
  } catch (error) {
    console.error('Error fetching job progress:', error);
    res.status(500).json({ message: 'Error fetching job progress' });
  }
});

// Update milestone status
router.patch('/milestone/:jobProgressId/:milestoneIndex', auth, async (req: AuthRequest, res) => {
  try {
    const { jobProgressId, milestoneIndex } = req.params;
    const { status, submissionUrl, feedback } = req.body;

    const jobProgress = await JobProgress.findById(jobProgressId);
    
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Check if user is authenticated
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has access to this job progress
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    const isFreelancer = jobProgress.freelancerId.equals(req.user._id);

    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the milestone
    const milestoneIndexNum = parseInt(milestoneIndex, 10);
    if (isNaN(milestoneIndexNum)) {
      return res.status(400).json({ message: 'Invalid milestone index' });
    }

    if (milestoneIndexNum < 0 || milestoneIndexNum >= jobProgress.milestones.length) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    const milestone = jobProgress.milestones[milestoneIndexNum as number];
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    milestone.status = status;
    if (submissionUrl) milestone.submissionUrl = submissionUrl;
    if (feedback) milestone.feedback = feedback;
    if (status === 'completed') milestone.completedAt = new Date();
    if (status === 'paid') milestone.paidAt = new Date();

    await jobProgress.save();
    res.json(jobProgress);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ message: 'Error updating milestone' });
  }
});

// Add rating
router.post('/rating/:jobProgressId', auth, async (req: AuthRequest, res) => {
  try {
    const { jobProgressId } = req.params;
    const { rating, review, type } = req.body;

    const jobProgress = await JobProgress.findById(jobProgressId);
    
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Check if user is authenticated
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has access to this job progress
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    const isFreelancer = jobProgress.freelancerId.equals(req.user._id);

    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user has already rated
    if (type === 'employer' && jobProgress.rating?.fromEmployer) {
      return res.status(400).json({ message: 'Employer has already rated this job' });
    }
    if (type === 'freelancer' && jobProgress.rating?.fromFreelancer) {
      return res.status(400).json({ message: 'Freelancer has already rated this job' });
    }

    // Add the rating
    const newRating = {
      rating,
      review,
      createdAt: new Date()
    };

    if (type === 'employer') {
      jobProgress.rating = {
        ...jobProgress.rating,
        fromEmployer: newRating
      };
    } else {
      jobProgress.rating = {
        ...jobProgress.rating,
        fromFreelancer: newRating
      };
    }

    await jobProgress.save();
    res.json(jobProgress);
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: 'Error adding rating' });
  }
});

// Get user progress
router.get('/user', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const jobProgresses = await JobProgress.find({
      $or: [
        { employerId: req.user._id },
        { freelancerId: req.user._id }
      ]
    }).populate('jobId', 'title company location type')
      .populate('freelancerId', 'name email')
      .populate('employerId', 'name email');

    res.json(jobProgresses);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ message: 'Error fetching user progress' });
  }
});

// Fund escrow
router.post('/:id/fund-escrow', auth, async (req: AuthRequest, res) => {
  try {
    const jobProgress = await JobProgress.findById(req.params.id);
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Verify employer
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    if (!isEmployer) {
      return res.status(403).json({ message: 'Only employers can fund escrow' });
    }

    // Verify amount matches total
    if (req.body.amount !== jobProgress.totalAmount) {
      return res.status(400).json({ message: 'Amount must match total project amount' });
    }

    // In a real implementation:
    // 1. Integrate with payment processor (Stripe/PayPal)
    // 2. Create payment intent/order
    // 3. Handle webhook for successful payment

    // For simulation:
    jobProgress.escrowStatus = 'fully_funded';
    jobProgress.escrowTotalFunded = jobProgress.totalAmount;
    jobProgress.milestones = jobProgress.milestones.map(m => ({
      ...m,
      escrowStatus: 'funded',
      escrowFundedAt: new Date()
    }));

    await jobProgress.save();
    res.json(jobProgress);
  } catch (error) {
    console.error('Error funding escrow:', error);
    res.status(500).json({ message: 'Error funding escrow' });
  }
});

// Initialize Razorpay payment for milestone
router.post('/:id/init-razorpay-payment/:milestoneIndex', auth, async (req: AuthRequest, res) => {
  try {
    const { id, milestoneIndex } = req.params;
    const { upiId } = req.body;
    
    const jobProgress = await JobProgress.findById(id);
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Verify employer
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    if (!isEmployer) {
      return res.status(403).json({ message: 'Only employers can fund escrow' });
    }

    const milestoneIdx = parseInt(milestoneIndex);
    if (isNaN(milestoneIdx) || milestoneIdx < 0 || milestoneIdx >= jobProgress.milestones.length) {
      return res.status(400).json({ message: 'Invalid milestone index' });
    }

    const milestone = jobProgress.milestones[milestoneIdx];
    
    // In a real implementation, you would:
    // 1. Initialize the Razorpay SDK with your key_id and key_secret
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET
    // });
    
    // 2. Create a Razorpay order
    // const order = await razorpay.orders.create({
    //   amount: milestone.amount * 100, // Razorpay expects amount in paisa (100 paisa = 1 INR)
    //   currency: 'INR',
    //   receipt: `milestone_${id}_${milestoneIdx}`,
    //   notes: {
    //     jobProgressId: id,
    //     milestoneIndex: milestoneIdx,
    //     upiId: upiId,
    //     description: milestone.title
    //   }
    // });
    
    // 3. Return the order details to the frontend
    // return res.json({
    //   orderId: order.id,
    //   amount: order.amount,
    //   currency: order.currency
    // });
    
    // For the simulation, we'll just return mock data
    return res.json({
      success: true,
      orderId: `order_${Date.now()}`,
      amount: milestone.amount * 100,
      currency: 'INR',
      keyId: 'rzp_test_mock_key', // This would be your actual Razorpay key_id in production
      prefillData: {
        name: req.user.name,
        email: req.user.email,
        contact: ''
      }
    });
  } catch (error) {
    console.error('Error initializing Razorpay payment:', error);
    res.status(500).json({ message: 'Error initializing payment' });
  }
});

// Verify Razorpay payment and fund escrow
router.post('/:id/verify-razorpay-payment/:milestoneIndex', auth, async (req: AuthRequest, res) => {
  try {
    const { id, milestoneIndex } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    const jobProgress = await JobProgress.findById(id);
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Verify employer
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    if (!isEmployer) {
      return res.status(403).json({ message: 'Only employers can fund escrow' });
    }

    const milestoneIdx = parseInt(milestoneIndex);
    if (isNaN(milestoneIdx) || milestoneIdx < 0 || milestoneIdx >= jobProgress.milestones.length) {
      return res.status(400).json({ message: 'Invalid milestone index' });
    }

    const milestone = jobProgress.milestones[milestoneIdx];

    // In a real implementation, you would:
    // 1. Verify the payment signature
    // const crypto = require('crypto');
    // const generatedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(razorpayOrderId + '|' + razorpayPaymentId)
    //   .digest('hex');
    
    // if (generatedSignature !== razorpaySignature) {
    //   return res.status(400).json({ message: 'Invalid payment signature' });
    // }
    
    // For the simulation, we'll just update the milestone
    milestone.escrowStatus = 'funded';
    milestone.escrowFundedAt = new Date();
    
    // Update total funded amount
    jobProgress.escrowTotalFunded = (jobProgress.escrowTotalFunded || 0) + milestone.amount;
    
    // Update overall escrow status based on all milestones
    const allMilestonesFunded = jobProgress.milestones.every(m => m.escrowStatus === 'funded' || m.escrowStatus === 'released');
    if (allMilestonesFunded) {
      jobProgress.escrowStatus = 'fully_funded';
    } else {
      jobProgress.escrowStatus = 'partially_funded';
    }

    await jobProgress.save();
    
    res.json({
      success: true,
      message: 'Payment verified and escrow funded successfully',
      jobProgress
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// Fund escrow for a specific milestone
router.post('/:id/fund-milestone-escrow/:milestoneIndex', auth, async (req: AuthRequest, res) => {
  try {
    const { id, milestoneIndex } = req.params;
    const { amount } = req.body;
    
    const jobProgress = await JobProgress.findById(id);
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }

    // Verify employer
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    if (!isEmployer) {
      return res.status(403).json({ message: 'Only employers can fund escrow' });
    }

    const milestoneIdx = parseInt(milestoneIndex);
    if (isNaN(milestoneIdx) || milestoneIdx < 0 || milestoneIdx >= jobProgress.milestones.length) {
      return res.status(400).json({ message: 'Invalid milestone index' });
    }

    const milestone = jobProgress.milestones[milestoneIdx];

    // Verify amount matches milestone amount
    if (amount !== milestone.amount) {
      return res.status(400).json({ message: 'Amount must match milestone amount' });
    }

    // In a real implementation:
    // 1. Integrate with payment processor (Stripe/PayPal)
    // 2. Create payment intent/order
    // 3. Handle webhook for successful payment

    // For simulation:
    milestone.escrowStatus = 'funded';
    milestone.escrowFundedAt = new Date();
    
    // Update total funded amount
    jobProgress.escrowTotalFunded = (jobProgress.escrowTotalFunded || 0) + amount;
    
    // Update overall escrow status based on all milestones
    const allMilestonesFunded = jobProgress.milestones.every(m => m.escrowStatus === 'funded' || m.escrowStatus === 'released');
    if (allMilestonesFunded) {
      jobProgress.escrowStatus = 'fully_funded';
    } else {
      jobProgress.escrowStatus = 'partially_funded';
    }

    await jobProgress.save();
    res.json(jobProgress);
  } catch (error) {
    console.error('Error funding milestone escrow:', error);
    res.status(500).json({ message: 'Error funding milestone escrow' });
  }
});

// Release escrow for milestone
router.post('/:id/release-escrow/:milestoneIndex', auth, async (req: AuthRequest, res) => {
  try {
    const { id, milestoneIndex } = req.params;
    const { feedback } = req.body;

    const jobProgress = await JobProgress.findById(id);
    if (!jobProgress) {
      return res.status(404).json({ message: 'Job progress not found' });
    }
    // Verify employer
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const isEmployer = jobProgress.employerId.equals(req.user._id);
    if (!isEmployer) {
      return res.status(403).json({ message: 'Only employers can release escrow' });
    }

    const milestone = jobProgress.milestones[parseInt(milestoneIndex)];
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Verify milestone is completed and funded
    if (milestone.status !== 'completed' || milestone.escrowStatus !== 'funded') {
      return res.status(400).json({ 
        message: 'Milestone must be completed and funded before releasing payment' 
      });
    }

    // In a real implementation:
    // 1. Trigger payment release through payment processor
    // 2. Handle successful transfer to freelancer
    // 3. Update platform fees/commission

    // For simulation:
    milestone.status = 'paid';
    milestone.escrowStatus = 'released';
    milestone.escrowReleasedAt = new Date();
    milestone.feedback = feedback;
    milestone.paidAt = new Date();

    // Update total amounts
    jobProgress.amountPaid += milestone.amount;
    
    // Update overall status if all milestones are paid
    const allMilestonesPaid = jobProgress.milestones.every(m => m.status === 'paid');
    if (allMilestonesPaid) {
      jobProgress.status = 'paid';
      jobProgress.escrowStatus = 'fully_released';
    } else {
      jobProgress.escrowStatus = 'partially_released';
    }

    await jobProgress.save();
    res.json(jobProgress);
  } catch (error) {
    console.error('Error releasing escrow:', error);
    res.status(500).json({ message: 'Error releasing escrow' });
  }
});

export default router; 