
// Mock data and API service to simulate backend functionality
// Later this will be replaced with real API calls

import { Job, Freelancer, Application } from '@/types';

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'React Developer',
    company: 'TechCorp Inc.',
    location: 'Remote',
    type: 'Full-time',
    salary: '$60,000 - $80,000',
    description: 'We are looking for an experienced React developer to join our team and help build cutting-edge web applications.',
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
    company: 'Design Studios',
    location: 'New York, NY',
    type: 'Contract',
    salary: '$40 - $60 per hour',
    description: 'Design Studios is seeking a talented UI/UX designer to create beautiful interfaces for our clients in the finance sector.',
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
      'Modern office in downtown NYC',
    ],
    createdAt: new Date('2023-10-10').toISOString(),
    employerId: '102',
  },
  {
    id: '3',
    title: 'Backend Developer (Node.js)',
    company: 'Server Solutions',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$70,000 - $90,000',
    description: 'Join our backend team and help build scalable APIs and services using Node.js and Express.',
    requirements: [
      'Strong Node.js and Express experience',
      'Database design and optimization skills',
      'Understanding of microservices architecture',
      'Experience with AWS or similar cloud platforms',
    ],
    benefits: [
      'Hybrid work model (3 days remote, 2 days office)',
      'Stock options',
      'Gym membership',
      'Catered lunches',
    ],
    createdAt: new Date('2023-10-05').toISOString(),
    employerId: '103',
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'WebStack Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$80,000 - $120,000',
    description: 'WebStack is looking for a talented full stack developer who can work on both frontend and backend technologies.',
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
    company: 'AppWorks',
    location: 'Chicago, IL',
    type: 'Contract',
    salary: '$50 - $70 per hour',
    description: 'We need a skilled mobile app developer to create cross-platform applications using React Native.',
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
    name: 'Alex Johnson',
    title: 'Senior React Developer',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    location: 'San Francisco, CA',
    bio: 'Experienced React developer with 7+ years of experience building scalable web applications.',
    yearsOfExperience: 7,
    hourlyRate: 65,
    skills: ['React', 'TypeScript', 'Redux', 'Node.js', 'GraphQL'],
    portfolio: [
      {
        title: 'E-commerce Platform',
        description: 'Built a complete e-commerce solution with React and Node.js.',
        link: 'https://example.com',
      },
      {
        title: 'Healthcare Dashboard',
        description: 'Developed an analytics dashboard for a healthcare provider.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'BS Computer Science',
        year: '2016',
      },
    ],
    contact: {
      email: 'alex.johnson@example.com',
      phone: '(555) 123-4567',
      linkedin: 'linkedin.com/in/alexjohnson',
    },
  },
  {
    id: '2',
    name: 'Sophia Lee',
    title: 'UI/UX Designer',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    location: 'New York, NY',
    bio: 'Creative UI/UX designer passionate about crafting beautiful interfaces that users love.',
    yearsOfExperience: 5,
    hourlyRate: 55,
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping'],
    portfolio: [
      {
        title: 'Banking App Redesign',
        description: 'Completely redesigned a banking app to improve user satisfaction.',
        link: 'https://example.com',
      },
      {
        title: 'Travel Platform UI Kit',
        description: 'Created a comprehensive UI kit for a travel booking platform.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'Rhode Island School of Design',
        degree: 'BFA Graphic Design',
        year: '2018',
      },
    ],
    contact: {
      email: 'sophia.lee@example.com',
      phone: '(555) 234-5678',
      linkedin: 'linkedin.com/in/sophialee',
    },
  },
  {
    id: '3',
    name: 'Miguel Rodriguez',
    title: 'Backend Developer',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    location: 'Austin, TX',
    bio: 'Backend developer specializing in building robust APIs and microservices.',
    yearsOfExperience: 6,
    hourlyRate: 60,
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'AWS'],
    portfolio: [
      {
        title: 'Payment Processing API',
        description: 'Developed a secure payment processing API for a fintech company.',
        link: 'https://example.com',
      },
      {
        title: 'Content Management System',
        description: 'Built a custom CMS for a media company with complex requirements.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'University of Texas at Austin',
        degree: 'MS Computer Engineering',
        year: '2017',
      },
    ],
    contact: {
      email: 'miguel.rodriguez@example.com',
      phone: '(555) 345-6789',
      linkedin: 'linkedin.com/in/miguelrodriguez',
    },
  },
  {
    id: '4',
    name: 'Emily Chen',
    title: 'Full Stack Developer',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    location: 'Seattle, WA',
    bio: 'Full stack developer with experience building web applications from concept to deployment.',
    yearsOfExperience: 4,
    hourlyRate: 50,
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
    portfolio: [
      {
        title: 'Project Management Tool',
        description: 'Developed a collaborative project management application.',
        link: 'https://example.com',
      },
      {
        title: 'Recipe Sharing Platform',
        description: 'Built a social platform for sharing and discovering recipes.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'University of Washington',
        degree: 'BS Computer Science',
        year: '2019',
      },
    ],
    contact: {
      email: 'emily.chen@example.com',
      phone: '(555) 456-7890',
      linkedin: 'linkedin.com/in/emilychen',
    },
  },
  {
    id: '5',
    name: 'David Kim',
    title: 'Mobile Developer',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    location: 'Los Angeles, CA',
    bio: 'Mobile developer specializing in creating cross-platform applications using React Native.',
    yearsOfExperience: 3,
    hourlyRate: 45,
    skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Firebase'],
    portfolio: [
      {
        title: 'Fitness Tracking App',
        description: 'Developed a mobile app for tracking workouts and nutrition.',
        link: 'https://example.com',
      },
      {
        title: 'Social Media Client',
        description: 'Built a mobile client for a new social media platform.',
        link: 'https://example.com',
      },
    ],
    education: [
      {
        institution: 'University of California, Los Angeles',
        degree: 'BS Computer Science',
        year: '2020',
      },
    ],
    contact: {
      email: 'david.kim@example.com',
      phone: '(555) 567-8901',
      linkedin: 'linkedin.com/in/davidkim',
    },
  },
];

// Mock applications data
const mockApplications: Application[] = [];

// Simulate API endpoints
export const api = {
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
  getFreelancers: async (): Promise<Freelancer[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockFreelancers];
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
  
  // Applications
  getApplications: async (): Promise<Application[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockApplications];
  },
  
  createApplication: async (application: Omit<Application, 'id' | 'createdAt'>): Promise<Application> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newApplication: Application = {
      id: String(mockApplications.length + 1),
      createdAt: new Date().toISOString(),
      ...application,
    };
    
    mockApplications.push(newApplication);
    return newApplication;
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
  }
};
