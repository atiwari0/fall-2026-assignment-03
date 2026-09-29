import { Router, Request, Response } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import { insertTimeLog, getTotalHoursForTicket } from '../dal/timeLogs.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit, offset, status } = req.query;

    const tickets = await getAllTickets({
      limit: limit !== undefined ? Number(limit) : undefined,
      offset: offset !== undefined ? Number(offset) : undefined,
      status: status !== undefined ? String(status) : undefined,
    });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
});

// GET /tickets/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve ticket' });
  }
});

// POST /tickets
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const creator_id = res.locals.userId;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTicket = await createTicket({
      title: title.trim(),
      description: description ?? '',
      creator_id,
      status: 'TODO',
    });

    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error in POST /tickets:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// PATCH /tickets/:id/status
router.patch(
  '/:id/status',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      if (!status || typeof status !== 'string' || status.trim() === '') {
        return res.status(400).json({ error: 'Status is required' });
      }

      const updated = await updateTicketStatus(id, status.trim());
      if (!updated) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update ticket status' });
    }
  },
);

// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
router.post(
  '/:id/time',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const { hours } = req.body;
      if (typeof hours !== 'number' || hours <= 0) {
        return res
          .status(400)
          .json({ error: 'Hours must be a positive number' });
      }

      const userId = res.locals.userId;

      const timeLog = await insertTimeLog(id, userId, hours);
      return res.status(201).json(timeLog);
    } catch (error) {
      console.error('Error in POST /tickets/:id/time:', error);
      return res.status(500).json({ error: 'Failed in log time' });
    }
  },
);

// GET /tickets/:id/time
router.get('/:id/time', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const totalHours = await getTotalHoursForTicket(id);

    return res.status(200).json({
      ticket_id: id,
      total_hours: totalHours,
    });
  } catch (error) {
    console.error('Error in GET /tickets/:id/time:', error);
    return res.status(500).json({ error: 'Failed to retrieve total hours' });
  }
});

export default router;
