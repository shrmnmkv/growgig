// Mock data and API service to simulate backend functionality
// Later this will be replaced with real API calls

import { Job, Freelancer, Application, User } from '@/types';

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'React Developer',
    company: 'TechSolutions India',
    location: 'Bengaluru, Karnataka',
    type: 'Full-time',
    salary: '₹6,00,000 - ₹8,00,000',
    description: 'We are looking for an experienced React developer to join our team and help build cutting-edge web applications for our clients across India.',
    requirements: [
      'At least 3 years of experience with React',
      'Strong understanding of JavaScript and TypeScript',
      'Experience with state management (Redux, Context API)',
      'Experience with RESTful APIs and GraphQL',
    ],
    benefits: [
      'Remote work',
      'Flexible hours',
      'Health insurance',
      'Professional development budget',
    ],
    createdAt: new Date('2023-10-15').toISOString(),
    employerId: '101',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    company: 'Creative Minds Design',
    location: 'Mumbai, Maharashtra',
    type: 'Contract',
    salary: '₹4,000 - ₹6,000 per day',
    description: 'Creative Minds Design is seeking a talented UI/UX designer to create beautiful interfaces for our clients in the finance sector.',
    requirements: [
      'Portfolio showing UI/UX design projects',
      'Experience with Figma, Sketch, or Adobe XD',
      'Understanding of user-centered design principles',
      'Knowledge of accessibility standards',
    ],
    benefits: [
      'Creative environment',
      'Portfolio growth opportunities',
      'Industry networking events',
      'Modern office in South Mumbai',
    ],
    createdAt: new Date('2023-10-10').toISOString(),
    employerId: '102',
  },
  {
    id: '3',
    title: 'Backend Developer (Node.js)',
    company: 'ServerTech Solutions',
    location: 'Hyderabad, Telangana',
    type: 'Full-time',
    salary: '₹7,00,000 - ₹9,00,000',
    description: 'Join our backend team and help build scalable APIs and services using Node.js and Express for our growing client base across India.',
    requirements: [
      'Strong Node.js and Express experience',
      'Database design and optimization skills',
      'Understanding of microservices architecture',
      'Experience with AWS or similar cloud platforms',
    ],
    benefits: [
      'Hybrid work model (3 days remote, 2 days office)',
      'ESOP options',
      'Gym membership',
      'Catered lunches',
    ],
    createdAt: new Date('2023-10-05').toISOString(),
    employerId: '103',
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'WebStack Technologies',
    location: 'Pune, Maharashtra',
    type: 'Full-time',
    salary: '₹8,00,000 - ₹12,00,000',
    description: 'WebStack is looking for a talented full stack developer who can work on both frontend and backend technologies for our fintech products.',
    requirements: [
      'Experience with React and Node.js',
      'Knowledge of database technologies (MongoDB, PostgreSQL)',
      'Understanding of CI/CD pipelines',
      'Good communication skills',
    ],
    benefits: [
      'Competitive salary',
      'Health, dental, and vision insurance',
      'Unlimited PTO',
      'Remote work options',
    ],
    createdAt: new Date('2023-09-28').toISOString(),
    employerId: '104',
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'AppInnovate',
    location: 'Delhi, NCR',
    type: 'Contract',
    salary: '₹5,000 - ₹7,000 per day',
    description: 'We need a skilled mobile app developer to create cross-platform applications using React Native for e-commerce and education sectors.',
    requirements: [
      'React Native experience',
      'iOS and Android development knowledge',
      'State management in mobile apps',
      'Experience with push notifications and API integration',
    ],
    benefits: [
      'Flexible working hours',
      'Project completion bonuses',
      'Modern coworking space access',
      'Networking opportunities',
    ],
    createdAt: new Date('2023-09-20').toISOString(),
    employerId: '105',
  },
];

// Mock freelancers data
const mockFreelancers: Freelancer[] = [
  {
    id: '1',
    name: 'Arjun Sharma',
    title: 'Senior React Developer',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    location: 'Bengaluru, Karnataka',
    bio: 'Experienced React developer with 7+ years of experience building scalable web applications for startups and enterprises across India.',
    yearsOfExperience: 7,
    hourlyRate: 1500,
    skills: ['React', 'TypeScript', 'Redux', 'Node.js', 'GraphQL'],
    portfolio: [
      {
        title: 'E-commerce Platform',
        description: 'Built a complete e-commerce solution with React and Node.js for a leading retail chain in India.',
        link: 'https://example.com',
      },
      {
        title: 'Healthcare Dashboard',
        description: 'Developed an analytics dashboard for a healthcare provider in Mumbai.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'Indian Institute of Technology, Bombay',
        degree: 'B.Tech Computer Science',
        year: '2016',
      },
    ],
    contact: {
      email: 'arjun.sharma@example.com',
      phone: '+91 98765 43210',
      linkedin: 'linkedin.com/in/arjunsharma',
    },
  },
  {
    id: '2',
    name: 'Priya Patel',
    title: 'UI/UX Designer',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    location: 'Mumbai, Maharashtra',
    bio: 'Creative UI/UX designer passionate about crafting beautiful interfaces that users love. Specialized in fintech and e-commerce applications.',
    yearsOfExperience: 5,
    hourlyRate: 1200,
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping'],
    portfolio: [
      {
        title: 'Banking App Redesign',
        description: 'Completely redesigned a banking app for one of India\'s largest private banks to improve user satisfaction.',
        link: 'https://example.com',
      },
      {
        title: 'Travel Platform UI Kit',
        description: 'Created a comprehensive UI kit for a travel booking platform focused on domestic Indian tourism.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'National Institute of Design, Ahmedabad',
        degree: 'BDes Graphic Design',
        year: '2018',
      },
    ],
    contact: {
      email: 'priya.patel@example.com',
      phone: '+91 95555 12345',
      linkedin: 'linkedin.com/in/priyapatel',
    },
  },
  {
    id: '3',
    name: 'Vikram Reddy',
    title: 'Backend Developer',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    location: 'Hyderabad, Telangana',
    bio: 'Backend developer specializing in building robust APIs and microservices for scale and performance.',
    yearsOfExperience: 6,
    hourlyRate: 1400,
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'AWS'],
    portfolio: [
      {
        title: 'Payment Processing API',
        description: 'Developed a secure payment processing API for a fintech company handling UPI and card transactions.',
        link: 'https://example.com',
      },
      {
        title: 'Content Management System',
        description: 'Built a custom CMS for a media company in Delhi with complex content distribution requirements.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'International Institute of Information Technology, Hyderabad',
        degree: 'MS Computer Engineering',
        year: '2017',
      },
    ],
    contact: {
      email: 'vikram.reddy@example.com',
      phone: '+91 82222 67890',
      linkedin: 'linkedin.com/in/vikramreddy',
    },
  },
  {
    id: '4',
    name: 'Aisha Khan',
    title: 'Full Stack Developer',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    location: 'Pune, Maharashtra',
    bio: 'Full stack developer with experience building web applications from concept to deployment for startups and established businesses.',
    yearsOfExperience: 4,
    hourlyRate: 1100,
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
    portfolio: [
      {
        title: 'Project Management Tool',
        description: 'Developed a collaborative project management application for a construction company in Pune.',
        link: 'https://example.com',
      },
      {
        title: 'Recipe Sharing Platform',
        description: 'Built a social platform for sharing and discovering Indian recipes with personalization features.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'Pune Institute of Computer Technology',
        degree: 'BE Computer Science',
        year: '2019',
      },
    ],
    contact: {
      email: 'aisha.khan@example.com',
      phone: '+91 91111 98765',
      linkedin: 'linkedin.com/in/aishakhan',
    },
  },
  {
    id: '5',
    name: 'Rahul Verma',
    title: 'Mobile Developer',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    location: 'Delhi, NCR',
    bio: 'Mobile developer specializing in creating cross-platform applications using React Native for businesses across India.',
    yearsOfExperience: 3,
    hourlyRate: 900,
    skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Firebase'],
    portfolio: [
      {
        title: 'Fitness Tracking App',
        description: 'Developed a mobile app for tracking workouts and nutrition with localized content for Indian users.',
        link: 'https://example.com',
      },
      {
        title: 'Social Media Client',
        description: 'Built a mobile client for a new social media platform targeting young professionals in tier 2 and 3 Indian cities.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'Delhi Technological University',
        degree: 'B.Tech Computer Science',
        year: '2020',
      },
    ],
    contact: {
      email: 'rahul.verma@example.com',
      phone: '+91 88888 12345',
      linkedin: 'linkedin.com/in/rahulverma',
    },
  },
];

// Mock applications data
const mockApplications: Application[] = [];

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'arjun.sharma@example.com',
    password: 'hashed_password_here',
    name: 'Arjun Sharma',
    role: 'freelancer',
    freelancerId: '1',
    createdAt: new Date('2023-01-15').toISOString()
  },
  {
    id: '2',
    email: 'priya.patel@example.com',
    password: 'hashed_password_here',
    name: 'Priya Patel',
    role: 'freelancer',
    freelancerId: '2',
    createdAt: new Date('2023-02-10').toISOString()
  },
  {
    id: '101',
    email: 'hr@techsolutions.com',
    password: 'hashed_password_here',
    name: 'Rajesh Kumar',
    role: 'employer',
    companyName: 'TechSolutions India',
    createdAt: new Date('2022-11-05').toISOString()
  },
  {
    id: '102',
    email: 'director@creativeminds.com',
    password: 'hashed_password_here',
    name: 'Neha Gupta',
    role: 'employer',
    companyName: 'Creative Minds Design',
    createdAt: new Date('2022-12-15').toISOString()
  }
];

// Pagination helper function
const paginateResults = <T>(items: T[], page: number = 1, itemsPerPage: number = 6) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    data: paginatedItems,
    total: items.length,
    totalPages: Math.ceil(items.length / itemsPerPage),
    currentPage: page,
    itemsPerPage
  };
};

// Filter helper function for freelancers
const filterFreelancers = (
  freelancers: Freelancer[],
  filters: {
    search?: string;
    location?: string;
    skills?: string[];
    minExperience?: number;
    maxExperience?: number;
    minRate?: number;
    maxRate?: number;
  }
) => {
  return freelancers.filter(freelancer => {
    // Search filter (name, title, or skills)
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = freelancer.name.toLowerCase().includes(searchLower);
      const titleMatch = freelancer.title.toLowerCase().includes(searchLower);
      const skillsMatch = freelancer.skills.some(skill => 
        skill.toLowerCase().includes(searchLower)
      );
      
      if (!(nameMatch || titleMatch || skillsMatch)) {
        return false;
      }
    }
    
    // Location filter
    if (filters.location && filters.location.trim() !== '') {
      if (!freelancer.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }
    
    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      const hasAllSkills = filters.skills.every(skill => 
        freelancer.skills.includes(skill)
      );
      if (!hasAllSkills) {
        return false;
      }
    }
    
    // Experience range filter
    if (filters.minExperience !== undefined && 
        freelancer.yearsOfExperience < filters.minExperience) {
      return false;
    }
    
    if (filters.maxExperience !== undefined && 
        freelancer.yearsOfExperience > filters.maxExperience) {
      return false;
    }
    
    // Hourly rate range filter
    if (filters.minRate !== undefined && 
        freelancer.hourlyRate < filters.minRate) {
      return false;
    }
    
    if (filters.maxRate !== undefined && 
        freelancer.hourlyRate > filters.maxRate) {
      return false;
    }
    
    return true;
  });
};

// Simulate API endpoints
export const api = {
  // Authentication
  login: async (email: string, pass: string): Promise<{ user: Omit<User, 'password'>, token: string } | null> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || user.password !== 'hashed_password_here') {
      return null;
    }
    
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token: 'mock_jwt_token_' + userWithoutPassword.id
    };
  },
  
  register: async (userData: { 
    email: string; 
    password: string; 
    name: string; 
    role: 'freelancer' | 'employer'; 
    companyName?: string;
  }): Promise<{ user: Omit<User, 'password'>, token: string } | null> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === userData.email)) {
      return null;
    }
    
    const newUser: User = {
      id: String(Date.now()),
      email: userData.email,
      password: 'hashed_password_here', // In a real app, this would be hashed
      name: userData.name,
      role: userData.role,
      companyName: userData.companyName,
      createdAt: new Date().toISOString()
    };
    
    // If registering as a freelancer, create a freelancer profile
    if (userData.role === 'freelancer') {
      const newFreelancer: Freelancer = {
        id: String(mockFreelancers.length + 1),
        name: userData.name,
        title: 'Freelancer',
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${mockFreelancers.length + 1}.jpg`,
        location: 'India',
        bio: '',
        yearsOfExperience: 0,
        hourlyRate: 500,
        skills: [],
        portfolio: [],
        education: [],
        contact: {
          email: userData.email,
          phone: '',
          linkedin: ''
        }
      };
      
      mockFreelancers.push(newFreelancer);
      newUser.freelancerId = newFreelancer.id;
    }
    
    mockUsers.push(newUser);
    
    const { password: pwd, ...userWithoutPassword } = newUser;
    
    return {
      user: userWithoutPassword,
      token: 'mock_jwt_token_' + userWithoutPassword.id
    };
  },
  
  // Jobs
  getJobs: async (): Promise<Job[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockJobs];
  },
  
  getJobById: async (id: string): Promise<Job | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockJobs.find(job => job.id === id);
  },
  
  createJob: async (job: Omit<Job, 'id' | 'createdAt'>): Promise<Job> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newJob: Job = {
      id: String(mockJobs.length + 1),
      createdAt: new Date().toISOString(),
      ...job,
    };
    
    mockJobs.push(newJob);
    return newJob;
  },
  
  // Freelancers
  getFreelancers: async (params?: {
    search?: string;
    location?: string;
    skills?: string[];
    minExperience?: number;
    maxExperience?: number;
    minRate?: number;
    maxRate?: number;
    page?: number;
    itemsPerPage?: number;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Apply filters if provided
    let filteredFreelancers = [...mockFreelancers];
    
    if (params) {
      filteredFreelancers = filterFreelancers(filteredFreelancers, params);
    }
    
    // Apply pagination
    return paginateResults(
      filteredFreelancers, 
      params?.page || 1, 
      params?.itemsPerPage || 6
    );
  },
  
  getFreelancerById: async (id: string): Promise<Freelancer | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFreelancers.find(freelancer => freelancer.id === id);
  },
  
  createFreelancer: async (freelancer: Omit<Freelancer, 'id'>): Promise<Freelancer> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newFreelancer: Freelancer = {
      id: String(mockFreelancers.length + 1),
      ...freelancer,
    };
    
    mockFreelancers.push(newFreelancer);
    return newFreelancer;
  },
  
  updateFreelancerProfile: async (id: string, updates: Partial<Omit<Freelancer, 'id'>>): Promise<Freelancer | null> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const freelancerIndex = mockFreelancers.findIndex(f => f.id === id);
    if (freelancerIndex === -1) return null;
    
    const updatedFreelancer = {
      ...mockFreelancers[freelancerIndex],
      ...updates
    };
    
    mockFreelancers[freelancerIndex] = updatedFreelancer;
    return updatedFreelancer;
  },
  
  // Applications
  getApplications: async (userId?: string, role?: 'freelancer' | 'employer'): Promise<Application[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!userId || !role) {
      return [...mockApplications];
    }
    
    if (role === 'freelancer') {
      return mockApplications.filter(app => app.freelancerId === userId);
    } else {
      // For employers, get applications for their jobs
      const employerJobs = mockJobs.filter(job => job.employerId === userId).map(job => job.id);
      return mockApplications.filter(app => employerJobs.includes(app.jobId));
    }
  },
  
  createApplication: async (application: Omit<Application, 'id' | 'createdAt'>): Promise<Application> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newApplication: Application = {
      id: String(mockApplications.length + 1),
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...application,
    };
    
    mockApplications.push(newApplication);
    return newApplication;
  },
  
  updateApplicationStatus: async (id: string, status: 'pending' | 'accepted' | 'rejected'): Promise<Application | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const applicationIndex = mockApplications.findIndex(app => app.id === id);
    if (applicationIndex === -1) return null;
    
    mockApplications[applicationIndex].status = status;
    return mockApplications[applicationIndex];
  },
  
  // Site Statistics
  getStatistics: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalJobs: mockJobs.length,
      totalFreelancers: mockFreelancers.length,
      totalCompanies: new Set(mockJobs.map(job => job.company)).size,
      totalCategories: new Set(mockJobs.map(job => job.title.split(' ')[0])).size,
    };
  },
  
  // Dashboard data
  getFreelancerDashboardData: async (freelancerId: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const applications = mockApplications.filter(app => app.freelancerId === freelancerId);
    const freelancer = mockFreelancers.find(f => f.id === freelancerId);
    
    return {
      applications,
      profile: freelancer,
      stats: {
        appliedJobs: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        acceptedApplications: applications.filter(app => app.status === 'accepted').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      }
    };
  },
  
  getEmployerDashboardData: async (employerId: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const postedJobs = mockJobs.filter(job => job.employerId === employerId);
    const jobIds = postedJobs.map(job => job.id);
    const applications = mockApplications.filter(app => jobIds.includes(app.jobId));
    
    return {
      postedJobs,
      applications,
      stats: {
        totalJobs: postedJobs.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        acceptedApplications: applications.filter(app => app.status === 'accepted').length,
      }
    };
  }
};
