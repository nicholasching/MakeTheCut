import { Router, type Request, type Response } from 'express';
import { User } from '../models/User.js';
import { MarkData } from '../models/MarkData.js';
import { v4 as uuidv4 } from 'uuid';

const router: Router = Router();

// ==========================================
// User Routes
// ==========================================

// GET /test/users - Get all users
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error });
    }
});

// POST /test/users - Create a new user
router.post('/users', async (req: Request, res: Response) => {
    try {
        const { entryYear, freeChoice } = req.body;
        // Generate a UUID if not provided? The schema requires uuid but it's usually generated. 
        // Let's generate one for testing convenience.
        const newUser = new User({
            _id: uuidv4(),
            entryYear,
            freeChoice
        });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user', details: error });
    }
});

// DELETE /test/users/:id - Delete a user by UUID (or Mongo ID? Schema says uuid is required prop, but _id exists too. Let's use _id for standard crud, or uuid if that's the primary key intention. The schema doesn't explicitly make uuid the _id, so it has both. Let's use standard _id for delete)
router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            // Try deleting by uuid if _id fails or just to be flexible
            const deletedByUuid = await User.findOneAndDelete({ _id: id });
            if (!deletedByUuid) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.json({ message: 'User deleted by UUID', user: deletedByUuid });
        }
        res.json({ message: 'User deleted', user: deletedUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user', details: error });
    }
});


// ==========================================
// Mark Data Routes
// ==========================================

// GET /test/marks - Get all mark data
router.get('/marks', async (req: Request, res: Response) => {
    try {
        const marks = await MarkData.find({});
        res.json(marks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mark data', details: error });
    }
});

// POST /test/marks - Create new mark data
router.post('/marks', async (req: Request, res: Response) => {
    try {
        const { _id, marks } = req.body; // MarkSchema uses _id as the person's generated uuidv4
        // If _id is not provided, we should probably fail or generate one, but the schema says it's the person's uuidv4
        if (!_id) {
            return res.status(400).json({ error: '_id (user uuid) is required' });
        }

        const newMarkData = new MarkData({
            _id,
            marks
        });
        await newMarkData.save();
        res.status(201).json(newMarkData);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create mark data', details: error });
    }
});

// DELETE /test/marks/:id - Delete mark data by ID
router.delete('/marks/:id', async (req: Request, res: Response) => {
    try {
        const deletedMark = await MarkData.findByIdAndDelete(req.params.id);
        if (!deletedMark) {
            return res.status(404).json({ error: 'Mark data not found' });
        }
        res.json({ message: 'Mark data deleted', data: deletedMark });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete mark data', details: error });
    }
});

export default router;
