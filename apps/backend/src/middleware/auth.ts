import { getSession } from "@auth/express"
import Google from "@auth/express/providers/google";
import type { Request, Response, NextFunction } from "express"
 
export async function authSession(req: Request, res: Response, next: NextFunction){
    try {
        // Retrieve session from Auth.js
        const session = await getSession(req, {
            providers: [
                Google({
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                })
            ],
            trustHost: true, // Required for OAuth callbacks
            secret: process.env.AUTH_SECRET!,
        });
        
        // Look up user from database to get Auth.js user ID (stored as _id)
        if (session?.user?.email) {
            try {
                const { User } = await import("../models/User.js");
                const userDoc = await User.findOne({ email: session.user.email });
                if (userDoc) {
                    // Add Auth.js user ID to res.locals
                    session.user.id = userDoc._id.toString();
                }
            } catch (dbError) {
                // Log but don't fail - user lookup is optional
                console.error('Error looking up user ID:', dbError);
            }
        }

        // Attach session to res.locals for use in routes
        res.locals.session = session
        res.locals.user = session?.user

        // Continue to next middleware or route
        next()
    } catch (error) {
        // If session retrieval fails, redirect to login
        return res.redirect('/login')
    }
}

export async function verifiedEmail(req: Request, res: Response, next: NextFunction){
    try {
        const session = res.locals.session
        
        if (!session?.user?.id) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // Check database to see if email is verified
        const { User } = await import("../models/User.js");
        const user = await User.findById(session.user.id);

        if (user?.verifiedEmail) {
            // User has verified email
            res.locals.verifiedEmail = true;
        } else {
            // User has not verified email
            res.locals.verifiedEmail = false;
            
            // If not on the verification route and email not verified, redirect
            if (!res.locals.verifyingEmail) {
                return res.redirect('/verify')
            }
        }

        next()
    } catch (error) {
        console.error("Error checking verified email:", error);
        // If error occurs, assume not verified and continue
        res.locals.verifiedEmail = false;
        if (!res.locals.verifyingEmail) {
            return res.redirect('/verify')
        }
        next()
    }
}