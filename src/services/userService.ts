import axios from 'axios';
import { axiosInstance } from '@/lib/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  title?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  skills?: string[];
  role?: string;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get('/users/profile');
      console.log('Profile data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Handle unauthorized error
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw error;
    }
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    try {
      // Log the incoming data
      console.log('Profile update - Raw data:', profileData);

      // Make sure we're sending valid data
      const validData = Object.entries(profileData).reduce((acc, [key, value]) => {
        // Include zero values for numeric fields
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'hourlyRate' || key === 'yearsOfExperience') {
            acc[key] = Number(value);
          } else if (key === 'skills' && Array.isArray(value)) {
            acc[key] = value.filter(Boolean); // Remove empty strings
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as Record<string, any>);

      // Log the processed data
      console.log('Profile update - Processed data:', validData);

      // Make the API call
      console.log('Making PATCH request to /users/profile');
      const response = await axiosInstance.patch('/users/profile', validData);
      
      // Log the response
      console.log('Profile update - Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Profile update - Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }

        throw new Error(error.response?.data?.message || 'Failed to update profile');
      }
      throw error;
    }
  }
}; 