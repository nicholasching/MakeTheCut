import { Router, type Request, type Response } from 'express';

const router: Router = Router();


// TODO: Make this require authentication, and return the user's profile
router.get('/', (req: Request, res: Response) => {
    res.json({
        id: "123",
        username: "test_user",
        node_env: process.env.NODE_ENV // Proof your secrets are working
    });
});

// TODO: return grade data
router.get('/grades', (req: Request, res: Response) => {

});

// TODO: update grade data and/or stream preferences
router.put('/grades', (req: Request, res: Response) => {

});

// TODO: for users who have gotten admitted to a stream; submit what they got into
router.post('/stream-admission', (req: Request, res: Response) => {

});

export default router;