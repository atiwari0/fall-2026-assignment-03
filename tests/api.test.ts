import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
    // TODO: Student implementation - Part 1: Integration Testing
    // Test user creation (POST /users)
    it('should create a new user (POST /users)', async () => {
      const userRes = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: `user_${Date.now()}@example.com`,
        });

        expect(userRes.status).toBe(201);
        expect(userRes.body).toHaveProperty('id');
    });

    // Test ticket creation (POST /tickets)
    it ('should create a ticket when authenticated (POST /tickets)', async() => {
      const userRes = await request(app)
      .post('/users')
      .send({
        name: 'Ticket Creator',
        email: `user_${Date.now()}@example.com`,
      });

      const userId = userRes.body.id;
      
      const res = await request(app)
        .post('/tickets')
        .set('X-User-Id', String(userId))
        .send({
          title: 'New Integration Ticket',
          description: 'Testing ticket creation',
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('New Integration Ticket');
        expect(res.body.creator_id).toBe(userId);
        expect(res.body.status).toBe('TODO');
    });

    // Test auth middleware rejection (401 when X-User-Id is missing or invalid)
    it ('should reject with 401 when X-User-Id is missing or invalid', async() => {
      const missingRes = await request(app)
        .post('/tickets')
        .send({
          title: 'Missing Auth Ticket',
          description: 'Testing missing header',
        });

      expect(missingRes.status).toBe(401);

      const invalidRes = await request(app)
        .post('/tickets')
        .set('X-User-Id', 'not-a-number')
        .send({
          title: 'Invalid Auth Ticket',
          description: 'Testing non-numeric header',
        });

      expect(invalidRes.status).toBe(401);

      const negativeRes = await request(app)
        .post('/tickets')
        .set('X-User-Id', '0')
        .send({
          title: 'Zero Auth Ticket',
          description: 'Testing non-positive header',
        });

      expect(negativeRes.status).toBe(401);
    });

    // Test 404 responses for non-existent users and tickets
    it ('should return 404 for non-existent users and tickets', async() => {
      const userRes = await request(app).get('/users/99999');
      expect(userRes.status).toBe(404);

      const ticketRes = await request(app).get('/tickets/99999');
      expect(ticketRes.status).toBe(404);
    });

    // Test pagination and filtering on GET /tickets
    it ('should support pagination and filtering on GET /tickets', async() => {
      const res = await request(app).get('/tickets?limit=5&offset=0&status=TODO');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(5);
    });
});
