import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone {
  title: string;
  description: string;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  escrowStatus: 'not_funded' | 'funded' | 'released';
  escrowFundedAt?: Date;
  escrowReleasedAt?: Date;
  submissionUrl?: string;
  feedback?: string;
  completedAt?: Date;
  paidAt?: Date;
}

export interface IJobProgress extends Document {
  applicationId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  status: 'in_progress' | 'completed' | 'under_review' | 'revision_requested' | 'payment_pending' | 'paid';
  milestones: IMilestone[];
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  totalAmount: number;
  amountPaid: number;
  escrowTotalFunded: number;
  escrowStatus: 'pending_deposit' | 'fully_funded' | 'partially_funded' | 'partially_released' | 'fully_released';
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

const jobProgressSchema = new Schema({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'under_review', 'revision_requested', 'payment_pending', 'paid'],
    default: 'in_progress'
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'paid'],
      default: 'pending'
    },
    escrowStatus: {
      type: String,
      enum: ['not_funded', 'funded', 'released'],
      default: 'not_funded'
    },
    escrowFundedAt: Date,
    escrowReleasedAt: Date,
    submissionUrl: String,
    feedback: String,
    completedAt: Date,
    paidAt: Date
  }],
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedEndDate: {
    type: Date,
    required: true
  },
  actualEndDate: Date,
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  escrowTotalFunded: {
    type: Number,
    default: 0
  },
  escrowStatus: {
    type: String,
    enum: ['pending_deposit', 'fully_funded', 'partially_funded', 'partially_released', 'fully_released'],
    default: 'pending_deposit'
  },
  nextPaymentDue: Date,
  rating: {
    fromEmployer: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    fromFreelancer: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  }
}, {
  timestamps: true
});

export const JobProgress = mongoose.model<IJobProgress>('JobProgress', jobProgressSchema); 