import mongoose from 'mongoose';

export interface IApplication extends mongoose.Document {
  jobId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposedRate?: string;
}

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  proposedRate: {
    type: String,
  },
}, {
  timestamps: true,
});

// Ensure a freelancer can only apply once to a job
applicationSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', applicationSchema); 