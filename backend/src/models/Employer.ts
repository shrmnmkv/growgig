import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  website: String,
  logo: String,
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Employer', employerSchema); 