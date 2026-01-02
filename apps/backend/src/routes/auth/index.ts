import express, { Router } from "express"
import { ExpressAuth } from "@auth/express"
import Google from "@auth/express/providers/google"
import type { Request, Response, NextFunction } from "express"
import { authSession } from "../../middleware/auth.js"

const router: Router = Router()

router.use((req: Request, res: Response, next: NextFunction) => {
    req.headers['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || 'http'
    next()
})

// Mount verify routes BEFORE Auth.js to prevent Auth.js from intercepting them
// Import and mount synchronously to avoid async issues
let verifyRouter: Router | null = null;
const loadVerifyRouter = async () => {
    if (!verifyRouter) {
        const module = await import("./verify/index.js");
        verifyRouter = module.default;
    }
    return verifyRouter;
};

router.use("/verify", async (req: Request, res: Response, next: NextFunction) => {
    const router = await loadVerifyRouter();
    router(req, res, next);
})
  
// Mount Auth.js on /auth routes
// - POST /auth/signin to login
// - GET  /auth/callback/google for Google OAuth callback
// - POST /auth/signout to logout

router.use("/", 
    ExpressAuth({
        providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
        ],
        trustHost: true, // Required for OAuth callbacks
        events: {
            // This event fires on every sign-in (including OAuth callbacks)
            signIn: async ({ user, isNewUser }) => {
                try {
                    // Lazy import to avoid circular dependencies
                    const { User } = await import("../../models/User.js");
                    
                    if (!user?.email || !user?.id) {
                        console.error("SignIn event: Missing user email or id");
                        return;
                    }

                    // Check if user exists by ID first (from Auth.js session), then by email as fallback
                    let existing = await User.findById(user.id);
                    if (!existing) {
                        existing = await User.findOne({ email: user.email });
                    }

                    if (!existing) {
                        // Create new user document using Auth.js user ID
                        const newUser = new User({
                            _id: user.id, // Use Auth.js user ID
                            email: user.email,
                            name: user.name || "",
                            image: user.image || "",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });

                        await newUser.save();
                        console.log(`Created new user document for ${user.email} (ID: ${user.id})`);
                    } else {
                        // Update existing user's info if needed (e.g., name or image changed)
                        if (existing.name !== (user.name || "") || existing.image !== (user.image || "")) {
                            existing.name = user.name || "";
                            existing.image = user.image || "";
                            existing.updatedAt = new Date();
                            await existing.save();
                            console.log(`Updated user document for ${user.email}`);
                        }
                    }
                } catch (err) {
                    console.error("Error in signIn event handler (user doc creation):", err);
                    // Don't throw - we don't want to break the auth flow
                }
            }
        }
    })
)

export default router