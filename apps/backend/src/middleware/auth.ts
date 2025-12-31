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
        });

        // Attach session to res.locals for use in routes
        res.locals.session = session
        res.locals.user = session?.user

        // Continue to next middleware or route
        next()
    } catch (error) {
        // If session retrieval fails, redirect to login
        res.redirect('/login')
    }
}