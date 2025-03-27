// Job related types
export interface Job {
  _id: string;
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string; // Full-time, Part-time, Contract, etc.
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  employerId: string | { _id: string; companyName: string };
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
  _id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

// Application related types
export interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    description: string;
  };
  freelancerId: {
    _id: string;
    name: string;
    email: string;
  };
  coverLetter: string;
  resumeUrl: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// User related types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'freelancer' | 'employer';
  companyName?: string;
  freelancerId?: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Dashboard data types
export interface FreelancerDashboardData {
  applications: Application[];
  profile: Freelancer | undefined;
  stats: {
    appliedJobs: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
  };
}

export interface EmployerDashboardData {
  postedJobs: Job[];
  applications: Application[];
  stats: {
    totalJobs: number;
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
  };
}

// Pagination response type
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

