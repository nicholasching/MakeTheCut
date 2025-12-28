import { Router, type Request, type Response, type NextFunction } from 'express';

const router: Router = Router();

// Get current year stream choice dist
router.get('stream-choices', (req: Request, res: Response) => {

});

// Get stream choice distribution for a year
router.get('stream-choices/:year', (req: Request, res: Response) => {

});

// Estimated cutoffs current year
router.get('cutoffs', (req: Request, res: Response) => {

});

// Est cutoffs for a year
router.get('cutoffs/:year', (req: Request, res: Response) => {

});

// Total contributions count (for the live counter on homepage)
router.get('total', (req: Request, res: Response) => {

});

// Grade dist for a course and year
router.get('grade-distribution/:course', (req: Request, res: Response) => {

});

// Grade dist for a course and year
router.get('grade-distribution/:course/:year', (req: Request, res: Response) => {

});

export default router;