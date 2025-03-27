import axios from 'axios';
import { axiosInstance } from '@/lib/axios';

export interface Milestone {
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'paid';
  completedAt?: string;
  paidAt?: string;
  escrowStatus?: 'not_funded' | 'funded' | 'released';
  escrowFundedAt?: string;
  escrowReleasedAt?: string;
  submissionUrl?: string;
  feedback?: string;
}

export interface JobProgress {
  _id: string;
  applicationId: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
  };
  freelancerId: {
    _id: string;
    name: string;
    email: string;
  };
  employerId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'in_progress' | 'completed' | 'under_review' | 'revision_requested' | 'payment_pending' | 'paid';
  milestones: Milestone[];
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  totalAmount: number;
  amountPaid: number;
  escrowTotalFunded?: number;
  escrowStatus?: 'pending_deposit' | 'fully_funded' | 'partially_funded' | 'partially_released' | 'fully_released';
  nextPaymentDue?: Date;
  rating?: {
    fromEmployer?: {
      rating: number;
      review: string;
      createdAt: Date;
    };
    fromFreelancer?: {
      rating: number;
      review: string;
      createdAt: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface InitializeJobProgressParams {
  applicationId: string;
  milestones: Omit<Milestone, 'status' | 'completedAt' | 'paidAt'>[];
  expectedEndDate: string;
}

export const jobProgressService = {
  initialize: async ({ applicationId, milestones, expectedEndDate }: InitializeJobProgressParams) => {
    try {
      const response = await axiosInstance.post('/job-progress/initialize', {
        applicationId,
        milestones,
        expectedEndDate
      });
      return response.data;
    } catch (error) {
      console.error('Error initializing job progress:', error);
      throw error;
    }
  },

  // Add a test method to verify connectivity
  testConnection: async (): Promise<{status: string}> => {
    try {
      // Try to access the health check endpoint without authentication
      console.log("Testing API connection...");
      const response = await axios.get('http://localhost:5001/api/health');
      console.log("Health check response:", response.data);
      return { status: 'connected' };
    } catch (error) {
      console.error('Error testing connection:', error);
      return { status: 'failed' };
    }
  },

  getByApplicationId: async (applicationId: string): Promise<JobProgress> => {
    try {
      const response = await axiosInstance.get(`/job-progress/application/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job progress:', error);
      throw error;
    }
  },

  updateMilestone: async (
    jobProgressId: string,
    milestoneIndex: number,
    data: {
      status: Milestone['status'];
      submissionUrl?: string;
      feedback?: string;
    }
  ): Promise<JobProgress> => {
    try {
      const response = await axiosInstance.patch(
        `/job-progress/milestone/${jobProgressId}/${milestoneIndex}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  },

  addRating: async (
    jobProgressId: string,
    data: {
      rating: number;
      review: string;
      type: 'employer' | 'freelancer';
    }
  ): Promise<JobProgress> => {
    try {
      const response = await axiosInstance.post(`/job-progress/rating/${jobProgressId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding rating:', error);
      throw error;
    }
  },

  getUserProgress: async (): Promise<JobProgress[]> => {
    try {
      console.log("Calling getUserProgress API endpoint");
      const response = await axiosInstance.get('/job-progress/user');
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      throw error;
    }
  },

  updateMilestones: async (
    jobProgressId: string,
    data: {
      milestones: Omit<Milestone, 'completedAt' | 'paidAt'>[];
    }
  ): Promise<JobProgress> => {
    try {
      const response = await axiosInstance.patch(`/job-progress/${jobProgressId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating milestones:', error);
      throw error;
    }
  },

  fundEscrow: async (jobProgressId: string, amount: number): Promise<JobProgress> => {
    try {
      const response = await axiosInstance.post(`/job-progress/${jobProgressId}/fund-escrow`, { amount });
      return response.data;
    } catch (error) {
      console.error('Error funding escrow:', error);
      throw error;
    }
  },

  fundMilestoneEscrow: async (jobProgressId: string, milestoneIndex: number, amount: number): Promise<JobProgress> => {
    try {
      // In a real implementation, this would be a two-step process:
      // 1. Initialize Razorpay payment
      const response = await axiosInstance.post(`/job-progress/${jobProgressId}/init-razorpay-payment/${milestoneIndex}`, { 
        upiId: 'sample@upi' // This would come from the form in a real implementation
      });

      // For demonstration purposes, we'll simulate a successful payment verification
      const verifyResponse = await axiosInstance.post(
        `/job-progress/${jobProgressId}/verify-razorpay-payment/${milestoneIndex}`,
        {
          razorpayOrderId: response.data.orderId,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: 'mock_signature'
        }
      );
      
      return verifyResponse.data.jobProgress;
    } catch (error) {
      console.error('Error in Razorpay payment flow:', error);
      throw error;
    }
  },

  releaseEscrow: async (
    jobProgressId: string,
    milestoneIndex: number,
    feedback?: string
  ): Promise<JobProgress> => {
    try {
      const response = await axiosInstance.post(
        `/job-progress/${jobProgressId}/release-escrow/${milestoneIndex}`,
        { feedback }
      );
      return response.data;
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  },

  // Add a new method for fetching freelancer projects
  getFreelancerProjects: async (freelancerId: string): Promise<JobProgress[]> => {
    try {
      console.log("Calling freelancer projects API with ID:", freelancerId);
      
      // Directly use /job-progress/user endpoint and filter on client side
      const response = await axiosInstance.get('/job-progress/user');
      console.log("API Response:", response.data);
      
      // Return the whole list - we'll filter on the component side if needed
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancer projects:', error);
      throw error;
    }
  },

  getByJobId: async (jobId: string) => {
    try {
      const response = await axiosInstance.get(`/job-progress/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job progress:', error);
      throw error;
    }
  }
}; 