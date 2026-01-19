import { describe, it, expect, beforeAll } from '@jest/globals';
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';
const client = axios.create({ baseURL: BASE_URL });

describe('Links Routes', () => {
  let token: string;
  let linkId: string;
  let trainingProgramId: string;

  beforeAll(async () => {
    // Login to get token
    const loginRes = await client.post('/api/admin/auth/login', {
      email: 'admin@deltaindo.co.id',
      password: 'admin123',
    });
    token = loginRes.data.data.token;

    // Get a training program
    const masterRes = await client.get('/api/admin/master-data');
    trainingProgramId = masterRes.data.data.trainingPrograms[0]?.id;
  });

  const authHeader = { Authorization: `Bearer ${token}` };

  describe('POST /api/admin/links', () => {
    it('should create a new registration link', async () => {
      const response = await client.post(
        '/api/admin/links',
        {
          trainingProgramId,
          maxRegistrations: 50,
        },
        { headers: authHeader }
      );

      expect(response.status).toBe(201);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data).toHaveProperty('code');
      expect(response.data.data.maxRegistrations).toBe(50);

      linkId = response.data.data.id;
    });

    it('should fail without training program id', async () => {
      try {
        await client.post(
          '/api/admin/links',
          { maxRegistrations: 50 },
          { headers: authHeader }
        );
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET /api/admin/links', () => {
    it('should list all registration links', async () => {
      const response = await client.get('/api/admin/links', {
        headers: authHeader,
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await client.get('/api/admin/links?page=1&limit=10', {
        headers: authHeader,
      });

      expect(response.status).toBe(200);
      expect(response.data.pagination).toHaveProperty('page');
      expect(response.data.pagination).toHaveProperty('limit');
    });
  });

  describe('GET /api/admin/links/:id', () => {
    it('should get a specific link', async () => {
      const response = await client.get(`/api/admin/links/${linkId}`, {
        headers: authHeader,
      });

      expect(response.status).toBe(200);
      expect(response.data.data.id).toBe(linkId);
    });

    it('should return 404 for non-existent link', async () => {
      try {
        await client.get('/api/admin/links/nonexistent', {
          headers: authHeader,
        });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('PUT /api/admin/links/:id', () => {
    it('should update a link', async () => {
      const response = await client.put(
        `/api/admin/links/${linkId}`,
        {
          maxRegistrations: 100,
        },
        { headers: authHeader }
      );

      expect(response.status).toBe(200);
      expect(response.data.data.maxRegistrations).toBe(100);
    });
  });

  describe('DELETE /api/admin/links/:id', () => {
    it('should delete a link', async () => {
      const response = await client.delete(`/api/admin/links/${linkId}`, {
        headers: authHeader,
      });

      expect(response.status).toBe(200);

      // Verify deletion
      try {
        await client.get(`/api/admin/links/${linkId}`, {
          headers: authHeader,
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});
