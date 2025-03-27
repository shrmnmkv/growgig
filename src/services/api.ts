// Mock data and API service to simulate backend functionality
// Later this will be replaced with real API calls

import { Job, Application, User } from '@/types';
import axios from 'axios';
import { API_URL } from '@/config';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'employer' | 'freelancer';
  companyName?: string;
  skills?: string[];
  bio?: string;
}

interface UpdateProfileData {
  name?: string;
  companyName?: string;
  skills?: string[];
  bio?: string;
  location?: string;
}

interface CreateApplicationData {
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  resumeUrl?: string;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service with authentication methods
export const api = {
  setAuthToken: (token: string | null) => {
    if (token) {
      sessionStorage.setItem('token', token);
      axiosInstance.defaults.headers.common['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    } else {
      sessionStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  auth: {
    login: async (email: string, password: string) => {
      const response = await axiosInstance.post('/users/login', { email, password });
      return response.data;
    },
    register: async (data: any) => {
      const response = await axiosInstance.post('/users/register', data);
      return response.data;
    },
    me: async () => {
      const response = await axiosInstance.get('/users/me');
      return response.data;
    },
    updateProfile: async (data: any) => {
      const response = await axiosInstance.patch('/users/profile', data);
      return response.data;
    },
    getProfile: async () => {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    },
  },

  jobs: {
    getAll: async (params?: {
      search?: string;
      location?: string;
      type?: string;
      minSalary?: number;
      maxSalary?: number;
      page?: number;
    }) => {
      const response = await axiosInstance.get('/jobs', { params });
      return response.data;
    },

    getOne: async (id: string) => {
      try {
        const response = await axiosInstance.get(`/jobs/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching job:', error);
        throw error;
      }
    },

    create: async (jobData: Partial<Job>) => {
      try {
        const response = await axiosInstance.post('/jobs', jobData);
        return response.data;
      } catch (error) {
        console.error('Error creating job:', error);
        throw error;
      }
    },

    update: async (id: string, jobData: Partial<Job>) => {
      try {
        const response = await axiosInstance.patch(`/jobs/${id}`, jobData);
        return response.data;
      } catch (error) {
        console.error('Error updating job:', error);
        throw error;
      }
    },

    delete: async (id: string) => {
      try {
        const response = await axiosInstance.delete(`/jobs/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting job:', error);
        throw error;
      }
    },

    updateStatus: async (id: string, status: string) => {
      const response = await axiosInstance.patch(`/jobs/${id}/status`, { status });
      return response.data;
    }
  },

  applications: {
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create application');
      }

      return response.json();
    },

    getMine: async () => {
      const response = await fetch(`${API_URL}/applications/mine`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          sessionStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch applications');
      }

      return response.json();
    },

    getOne: async (id: string) => {
      const response = await fetch(`${API_URL}/applications/${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Not authorized to view this application');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch application');
      }

      return response.json();
    },

    getByJobId: async (jobId: string) => {
      const response = await fetch(`${API_URL}/applications/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Not authorized to view these applications');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch applications');
      }

      return response.json();
    },

    updateStatus: async (id: string, status: 'accepted' | 'rejected') => {
      const response = await fetch(`${API_URL}/applications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Not authorized to update this application');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to update application status');
      }

      return response.json();
    }
  },

  statistics: {
    getAll: async () => {
      const response = await axiosInstance.get('/statistics');
      return response.data;
    }
  },

  dashboard: {
    getEmployerData: async () => {
      const response = await axiosInstance.get('/dashboard/employer');
      return response.data;
    },

    getFreelancerData: async () => {
      const response = await axiosInstance.get('/dashboard/freelancer');
      return response.data;
    }
  },

  // Freelancer API
  freelancers: {
    createFreelancer: async (freelancerData: any) => {
      const response = await axiosInstance.post('/freelancers', freelancerData);
      return response.data;
    },
    getFreelancerById: async (id: string) => {
      const response = await axiosInstance.get(`/freelancers/${id}`);
      return response.data;
    },
    updateFreelancerProfile: async (id: string, data: any) => {
      const response = await axiosInstance.patch(`/freelancers/${id}`, data);
      return response.data;
    },
    getFreelancers: async (params: { search?: string }) => {
      const response = await axiosInstance.get('/freelancers', { params });
      return response.data;
    }
  },

  // Employers API
  employers: {
    getEmployers: async (params: { search?: string }) => {
      const response = await axiosInstance.get('/employers', { params });
      return response.data;
    },

    getEmployerById: async (id: string) => {
      const response = await axiosInstance.get(`/employers/${id}`);
      return response.data;
    },

    updateEmployerProfile: async (id: string, profileData: any) => {
      const response = await axiosInstance.patch(`/employers/${id}`, profileData);
      return response.data;
    }
  },

  upload: {
    avatar: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axiosInstance.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  }
};
