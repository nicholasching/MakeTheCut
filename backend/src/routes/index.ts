import { Router, type Request, type Response } from 'express';

const router = Router();

// GET /api/dummy/
router.get('/', (req: Request, res: Response) => {
    res.json({ message: "Dummy root reached" });
});

// GET /api/dummy/user
router.get('/user', (req: Request, res: Response) => {
    res.json({ 
        id: "123", 
        username: "test_user",
        node_env: process.env.NODE_ENV // Proof your secrets are working
    });
});

export default router;