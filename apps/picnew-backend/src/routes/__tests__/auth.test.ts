import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';
const client = axios.create({ baseURL: BASE_URL });

describe('Auth Routes', () => {
  let token: string;
  const testUser = {
    email: 'test@example.com',
    password: 'Test@123!',
    name: 'Test User',
  };

  describe('POST /api/admin/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await client.post('/api/admin/auth/login', {
        email: 'admin@deltaindo.co.id',
        password: 'admin123',
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data).toHaveProperty('user');
      expect(response.data.data.user.email).toBe('admin@deltaindo.co.id');

      token = response.data.data.token;
    });

    it('should fail with invalid email', async () => {
      try {
        await client.post('/api/admin/auth/login', {
          email: 'nonexistent@example.com',
          password: 'password123',
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should fail with invalid password', async () => {
      try {
        await client.post('/api/admin/auth/login', {
          email: 'admin@deltaindo.co.id',
          password: 'wrongpassword',
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('GET /api/admin/auth/me', () => {
    it('should return current user with valid token', async () => {
      const response = await client.get('/api/admin/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data).toHaveProperty('email');
    });

    it('should fail without token', async () => {
      try {
        await client.get('/api/admin/auth/me');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should fail with invalid token', async () => {
      try {
        await client.get('/api/admin/auth/me', {
          headers: { Authorization: 'Bearer invalid.token.here' },
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });
  });
});
