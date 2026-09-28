import { Router, Request, Response } from 'express';
import { getAllUsers, getUserById, createUser } from '../dal/users.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes
// GET /users
router.get('/', async (_req: Request, res: Response) => {
    try{
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch(error) {
        res.status(500).json({ error: 'Failed to retrieve users.' });
    }
});

// GET /users/:id
router.get('/:id', async (req: Request, res: Response) => {
    try{
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0){
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await getUserById(id);
        if (!user){
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch(error) {
        res.status(500).json({ error: 'Failed to retrieve users.' });
    }
});

// POST /users

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const newUser = await createUser({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
