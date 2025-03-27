import mongoose from 'mongoose';

const freelancerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 100
  },
  skills: [{
    type: String
  }],
  experience: [{
    title: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: String,
    description: {
      type: String,
      required: true
    }
  }],
  portfolio: [{
    title: String,
    description: String,
    link: String
  }],
  education: [{
    institution: String,
    degree: String,
    year: String
  }],
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    linkedin: String
  }
}, {
  timestamps: true
});

const Freelancer = mongoose.model('Freelancer', freelancerSchema);

export default Freelancer; 