import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: string;
  type: string;
  salary: string;
  employerId: mongoose.Types.ObjectId;
  status: 'open' | 'closed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    default: []
  },
  benefits: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'completed', 'cancelled'],
    default: 'open'
  }
}, {
  timestamps: true
});

export default mongoose.model<IJob>('Job', JobSchema); 