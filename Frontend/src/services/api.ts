import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { 
  User, 
  AuthResponse, 
  Case, 
  Complaint, 
  PaginatedResponse,
  Evidence
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Only redirect if not already on login/register/home page
          const currentPath = window.location.pathname;
          if (currentPath !== '/' && 
              !currentPath.includes('/login') && 
              !currentPath.includes('/register')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Endpoints
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/users/login/', {
      username,
      password,
    });
    return response.data;
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: string;
    badge_number?: string;
    phone_number?: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/users/register/', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/users/me/');
    return response.data;
  }

  // Case Endpoints
  async getCases(params?: {
    page?: number;
    status?: string;
    crime_level?: number;
    search?: string;
  }): Promise<PaginatedResponse<Case>> {
    const response = await this.api.get<PaginatedResponse<Case>>('/cases/', { params });
    return response.data;
  }

  async getCase(id: number): Promise<Case> {
    const response = await this.api.get<Case>(`/cases/${id}/`);
    return response.data;
  }

  async createCase(data: Partial<Case>): Promise<Case> {
    const response = await this.api.post<Case>('/cases/', data);
    return response.data;
  }

  async updateCase(id: number, data: Partial<Case>): Promise<Case> {
    const response = await this.api.patch<Case>(`/cases/${id}/`, data);
    return response.data;
  }

  // Complaint Endpoints
  async getComplaints(params?: {
    page?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Complaint>> {
    const response = await this.api.get<PaginatedResponse<Complaint>>('/complaints/', { params });
    return response.data;
  }

  async getComplaint(id: number): Promise<Complaint> {
    const response = await this.api.get<Complaint>(`/complaints/${id}/`);
    return response.data;
  }

  async createComplaint(data: Partial<Complaint>): Promise<Complaint> {
    const response = await this.api.post<Complaint>('/complaints/', data);
    return response.data;
  }

  async updateComplaint(id: number, data: Partial<Complaint>): Promise<Complaint> {
    const response = await this.api.patch<Complaint>(`/complaints/${id}/`, data);
    return response.data;
  }

  // User Endpoints
  async getUsers(params?: {
    page?: number;
    role?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<PaginatedResponse<User>>('/auth/users/', { params });
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await this.api.get<User>(`/auth/users/${id}/`);
    return response.data;
  }

  // Evidence Endpoints
  async getEvidence(params?: {
    page?: number;
    case?: number;
    evidence_type?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Evidence>> {
    const response = await this.api.get<PaginatedResponse<Evidence>>('/evidence/', { params });
    return response.data;
  }

  async getEvidenceByCase(caseId: number): Promise<PaginatedResponse<Evidence>> {
    return this.getEvidence({ case: caseId });
  }

  // Document Upload
  async uploadDocumentToCase(
    caseId: number,
    file: File,
    description?: string
  ): Promise<{ message: string; evidence_id: number; evidence_number: string; file: { name: string; path: string; url: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await this.api.post(
      `/cases/${caseId}/upload-document/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export const apiService = new ApiService();