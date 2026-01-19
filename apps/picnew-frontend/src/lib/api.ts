import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('picnew_token');
    }

    // Add interceptor for auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('picnew_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('picnew_token');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/api/admin/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/admin/auth/me');
    return response.data;
  }

  // Registration Links
  async getLinks(page = 1, limit = 10, search = '') {
    const response = await this.client.get('/api/admin/links', {
      params: { page, limit, search },
    });
    return response.data;
  }

  async getLink(id: string) {
    const response = await this.client.get(`/api/admin/links/${id}`);
    return response.data;
  }

  async createLink(trainingProgramId: string, maxRegistrations?: number, expiredAt?: string) {
    const response = await this.client.post('/api/admin/links', {
      trainingProgramId,
      maxRegistrations,
      expiredAt,
    });
    return response.data;
  }

  async updateLink(id: string, data: any) {
    const response = await this.client.put(`/api/admin/links/${id}`, data);
    return response.data;
  }

  async deleteLink(id: string) {
    const response = await this.client.delete(`/api/admin/links/${id}`);
    return response.data;
  }

  // Training Programs
  async getTrainingPrograms(bidangId?: string, page = 1, limit = 20) {
    const response = await this.client.get('/api/admin/training', {
      params: { bidangId, page, limit },
    });
    return response.data;
  }

  async getTrainingProgram(id: string) {
    const response = await this.client.get(`/api/admin/training/${id}`);
    return response.data;
  }

  async createTrainingProgram(data: any) {
    const response = await this.client.post('/api/admin/training', data);
    return response.data;
  }

  async updateTrainingProgram(id: string, data: any) {
    const response = await this.client.put(`/api/admin/training/${id}`, data);
    return response.data;
  }

  async deleteTrainingProgram(id: string) {
    const response = await this.client.delete(`/api/admin/training/${id}`);
    return response.data;
  }

  // Registrations
  async getRegistrations(linkId?: string, status?: string, page = 1, limit = 20) {
    const response = await this.client.get('/api/admin/registrations', {
      params: { linkId, status, page, limit },
    });
    return response.data;
  }

  async getRegistration(id: string) {
    const response = await this.client.get(`/api/admin/registrations/${id}`);
    return response.data;
  }

  async approveRegistration(id: string) {
    const response = await this.client.post(`/api/admin/registrations/${id}/approve`);
    return response.data;
  }

  async rejectRegistration(id: string, reason: string) {
    const response = await this.client.post(`/api/admin/registrations/${id}/reject`, {
      reason,
    });
    return response.data;
  }

  async exportRegistrations(linkId: string) {
    const response = await this.client.get(`/api/admin/registrations/${linkId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Master Data
  async getMasterData() {
    const response = await this.client.get('/api/admin/master-data');
    return response.data;
  }

  async getBidangs() {
    const response = await this.client.get('/api/admin/master-data/bidangs');
    return response.data;
  }

  async getTrainingClasses() {
    const response = await this.client.get('/api/admin/master-data/classes');
    return response.data;
  }

  async getPersonnelTypes() {
    const response = await this.client.get('/api/admin/master-data/personnel-types');
    return response.data;
  }

  async getDocumentTypes() {
    const response = await this.client.get('/api/admin/master-data/document-types');
    return response.data;
  }

  async getRegions() {
    const response = await this.client.get('/api/admin/master-data/regions');
    return response.data;
  }

  async getRegencies(provinceId: string) {
    const response = await this.client.get(`/api/admin/master-data/regions/${provinceId}/regencies`);
    return response.data;
  }

  async getDistricts(regencyId: string) {
    const response = await this.client.get(`/api/admin/master-data/regencies/${regencyId}/districts`);
    return response.data;
  }

  async getVillages(districtId: string) {
    const response = await this.client.get(`/api/admin/master-data/districts/${districtId}/villages`);
    return response.data;
  }

  async getPICs() {
    const response = await this.client.get('/api/admin/master-data/pics');
    return response.data;
  }

  async getMarketing() {
    const response = await this.client.get('/api/admin/master-data/marketing');
    return response.data;
  }
}

export const apiClient = new APIClient();
