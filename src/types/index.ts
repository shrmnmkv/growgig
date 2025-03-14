
// Job related types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // Full-time, Part-time, Contract, etc.
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  createdAt: string;
  employerId: string;
}

// Freelancer related types
export interface PortfolioItem {
  title: string;
  description: string;
  link: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  linkedin: string;
}

export interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  location: string;
  bio: string;
  yearsOfExperience: number;
  hourlyRate: number;
  skills: string[];
  portfolio: PortfolioItem[];
  education: Education[];
  contact: ContactInfo;
}

// Application related types
export interface Application {
  id: string;
  jobId: string;
  freelancerId: string;
  resumeUrl: string;
  coverLetter: string;
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
