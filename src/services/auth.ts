import axios from 'axios';
import { User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    // Initialize from sessionStorage
    this.token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting login to:', `${API_URL}/users/login`);
      const response = await axios.post<AuthResponse>(`${API_URL}/users/login`, {
        email,
        password,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const { token, user } = response.data;
      this.setAuth(token, user);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'freelancer' | 'employer';
  }): Promise<AuthResponse> {
    try {
      console.log('Attempting registration to:', `${API_URL}/users/register`);
      const response = await axios.post<AuthResponse>(`${API_URL}/users/register`, userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const { token, user } = response.data;
      this.setAuth(token, user);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  public logout(): void {
    this.token = null;
    this.user = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.user;
  }

  private setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  }
}

export const authService = AuthService.getInstance(); 