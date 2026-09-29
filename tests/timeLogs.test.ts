import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('should pass placeholder test', async () => {
    // TODO: Student implementation - Part 2: Time Logging Tests
    const userRes = await request(app)
      .post('/users')
      .send({
        name: 'Tester',
        email: `user_${Date.now()}@example.com`,
      });
    const userId = userRes.body.id;

    const ticketRes = await request(app)
      .post('/tickets')
      .set('x-user-id', String(userId))
      .send({ title: 'Track' });
    const ticketId = ticketRes.body.id;

    // Log hours for a ticket (POST /tickets/:id/time)
    const log1 = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('x-user-id', String(userId))
      .send({ hours: 4 });
    expect(log1.status).toBe(201);

    const log2 = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('x-user-id', String(userId))
      .send({ hours: 3 });
    expect(log2.status).toBe(201);

    // Fetch total hours for a ticket (GET /tickets/:id/time)
    const res = await request(app)
      .get(`/tickets/${ticketId}/time`)
      .set('x-user-id', String(userId));

    // Verify aggregation math
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ticket_id: ticketId,
      total_hours: 7,
    });
  });
});
