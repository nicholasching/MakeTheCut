import { Router, type Request, type Response } from 'express';

const router: Router = Router();

// GET /api/dummy/
router.get('/', (req: Request, res: Response) => {
    res.json({ message: "Dummy root reached" });
});

export default router;