import { Router } from "express";
import { sendVerificationEmail, verifyOTP } from "../../../controllers/verifyMail.js";
import { authSession, verifiedEmail } from "../../../middleware/auth.js";
import type { Request, Response, NextFunction } from "express"


const router: Router = Router()

// Check user is logged in
router.use("/", authSession)

// Check if user has already verified email
router.use("/", async (req: Request, res: Response, next: NextFunction) => {
    res.locals.verifyingEmail = true;
    await verifiedEmail(req, res, next)
})

// - POST /auth/verify to send verification email
router.post('/', async (req: Request, res: Response) => {
    try {
        const session = res.locals.session;
        const { emailToVerify } = req.body;

        if (!session?.user?.id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        if (!emailToVerify) {
            return res.status(400).json({ success: false, message: 'emailToVerify is required' });
        }

        if (res.locals.verifiedEmail) {
            // User already has a verified email
            return res.json({ success: true, message: 'Email already verified' });
        }

        const result = await sendVerificationEmail(session.user.id, emailToVerify);
        
        if (result.success) {
            res.json({ success: true, message: 'Verification email sent successfully' });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }
})

// - POST /auth/verify/otp to verify OTP
router.post('/otp', async (req: Request, res: Response) => {
    try {
        const session = res.locals.session;
        const { emailToVerify, otp } = req.body;

        if (!session?.user?.id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        if (!emailToVerify || !otp) {
            return res.status(400).json({ success: false, message: 'emailToVerify and otp are required' });
        }

        const result = await verifyOTP(session.user.id, emailToVerify, otp);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'An error occurred while verifying the OTP' });
    }
})

export default router;