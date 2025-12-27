import express, { Router } from "express"
import { ExpressAuth } from "@auth/express"
import Google from "@auth/express/providers/google"
import type { Request, Response, NextFunction } from "express"

const router: Router = Router()

router.use((req: Request, res: Response, next: NextFunction) => {
    req.headers['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || 'http'
    next()
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
    })
)

export default router