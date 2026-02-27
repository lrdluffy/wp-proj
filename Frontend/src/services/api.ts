import axios, { AxiosError, type AxiosInstance } from 'axios';
import type {
  User,
  AuthResponse,
  Case,
  Complaint,
  PaginatedResponse,
  Evidence,
  Suspect, Trial,
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

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Token ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!['/', '/login', '/register'].includes(window.location.pathname)) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/users/login/', { username, password });
    return response.data;
  }

  async register(data: any): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/users/register/', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/users/me/');
    return response.data;
  }

  async getCases(params?: any): Promise<PaginatedResponse<Case>> {
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

  async getComplaints(params?: any): Promise<PaginatedResponse<Complaint>> {
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

  async rejectComplaint(id: number, feedback: string) {
    return this.api.post(`/complaints/${id}/reject_by_trainee/`, { feedback });
  }

  async sendBackToTrainee(id: number, feedback: string) {
    return this.api.post(`/complaints/${id}/send_back_to_trainee/`, { feedback });
  }

  async sendToOfficer(id: number) {
    return this.api.post(`/complaints/${id}/send_to_officer/`);
  }

  async approveComplaint(id: number) {
    return this.api.post(`/complaints/${id}/approve_and_create_case/`);
  }

  async getUser(id: number): Promise<User> {
    const response = await this.api.get<User>(`/auth/users/${id}/`);
    return response.data;
  }

  async getUsers(params?: any): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<PaginatedResponse<User>>('/auth/users/', { params });
    return response.data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await this.api.patch<User>(`/auth/users/${id}/`, data);
    return response.data;
  }

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

  // متد جدید برای دریافت جزئیات مدرک
  async getEvidenceDetail(id: string | number | undefined): Promise<Evidence> {
    const response = await this.api.get<Evidence>(`/evidence/${id}/`);
    return response.data;
  }

  async createEvidence(data: FormData): Promise<Evidence> {
    const response = await this.api.post<Evidence>('/evidence/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

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

  async approveCase(id: number) {
    return this.api.post(`/cases/${id}/approve//`);
  }

  async getSuspects(params?: any): Promise<PaginatedResponse<Suspect>> {
    const response = await this.api.get<PaginatedResponse<Suspect>>('/suspects/', { params });
    return response.data;
  }

  async createSuspect(data: Partial<Suspect>): Promise<Suspect> {
    const response = await this.api.post<Suspect>('/suspects/', data);
    return response.data;
  }

  async updateSuspect(suspectId: number, data: Partial<Suspect>): Promise<Suspect> {
    const response = await this.api.patch<Suspect>(`/suspects/${suspectId}/`, data);
    return response.data;
  }

  async arrestSuspect(suspectId: number): Promise<Suspect> {
    const response = await this.api.post<Suspect>(`/suspects/${suspectId}/arrest/`);
    return response.data;
  }

  async recordInterrogationScore(
    suspectId: number,
    payload: { probability: number; notes?: string }
  ): Promise<Suspect> {
    const response = await this.api.post<Suspect>(`/suspects/${suspectId}/record_interrogation_score/`, payload);
    return response.data;
  }

  async submitCaptainDecision(
    suspectId: number,
    payload: { final_probability: number; statement: string }
  ): Promise<Suspect> {
    const response = await this.api.post<Suspect>(`/suspects/${suspectId}/captain_decision/`, payload);
    return response.data;
  }

  async submitChiefReview(
    suspectId: number,
    payload: { approved: boolean; comment?: string }
  ): Promise<Suspect> {
    const response = await this.api.post<Suspect>(`/suspects/${suspectId}/chief_review/`, payload);
    return response.data;
  }
  
  async startBailPayment(suspectId: number): Promise<{ payment_url: string; payment_number: string; authority: string }> {
    const response = await this.api.post<{ payment_url: string; payment_number: string; authority: string }>(
      '/payments/zarinpal/start/',
      { suspect_id: suspectId },
    );
    return response.data;
  }

  async getTrials(params?: any): Promise<PaginatedResponse<Trial>> {
    const response = await this.api.get<PaginatedResponse<Trial>>('/trials/', { params });
    return response.data;
  }
}

export const apiService = new ApiService();